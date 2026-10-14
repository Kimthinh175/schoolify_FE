import { QuestionBank, Question, ParsedQuestionItem, ParseImportResult, QuestionBankReviewStatus } from '@/types';
import { MOCK_QUESTION_BANKS } from './mock/data';
import mammoth from 'mammoth';
import JSZip from 'jszip';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function recalcCount(bank: QuestionBank) {
  bank.questions_count = bank.questions?.length ?? 0;
  bank.updated_at = new Date().toISOString();
}

/** Chuyển đổi công thức toán Word OMML (<m:oMath>) sang định dạng LaTeX ($...$) chuẩn xác */
function ommlToLatex(ommlStr: string): string {
  let res = ommlStr;
  let prev = '';

  while (prev !== res) {
    prev = res;
    // 1. Dấu ngoặc <m:d>...</m:d> -> ( content )
    res = res.replace(/<m:d(?:\s[^>]*)?>[\s\S]*?<m:e(?:\s[^>]*)?>([\s\S]*?)<\/m:e>[\s\S]*?<\/m:d>/g, (m, content) => `(${content})`);
    // 2. Phân số <m:f>: <m:num>N</m:num><m:den>D</m:den> -> \frac{N}{D}
    res = res.replace(/<m:f(?:\s[^>]*)?>[\s\S]*?<m:num(?:\s[^>]*)?>([\s\S]*?)<\/m:num>[\s\S]*?<m:den(?:\s[^>]*)?>([\s\S]*?)<\/m:den>[\s\S]*?<\/m:f>/g, (m, num, den) => `\\frac{${num}}{${den}}`);
    // 3. Số mũ <m:sSup>: <m:e>E</m:e><m:sup>S</m:sup> -> E^{S}
    res = res.replace(/<m:sSup(?:\s[^>]*)?>[\s\S]*?<m:e(?:\s[^>]*)?>([\s\S]*?)<\/m:e>[\s\S]*?<m:sup(?:\s[^>]*)?>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSup>/g, (m, e, s) => `${e}^{${s}}`);
    // 4. Chỉ số dưới <m:sSub>: <m:e>E</m:e><m:sub>S</m:sub> -> E_{S}
    res = res.replace(/<m:sSub(?:\s[^>]*)?>[\s\S]*?<m:e(?:\s[^>]*)?>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub(?:\s[^>]*)?>([\s\S]*?)<\/m:sub>[\s\S]*?<\/m:sSub>/g, (m, e, s) => `${e}_{${s}}`);
    // 5. Loại bỏ thẻ <m:r> và <w:r>
    res = res.replace(/<(?:m:r|w:r)(?:\s[^>]*)?>([\s\S]*?)<\/(?:m:r|w:r)>/g, (m, content) => content);
    // 6. Lấy chữ từ thẻ <m:t> và <w:t>
    res = res.replace(/<(?:m:t|w:t)(?:\s[^>]*)?>([\s\S]*?)<\/(?:m:t|w:t)>/g, (m, txt) => txt);
  }

  res = res.replace(/<[^>]+>/g, '');
  return res.trim();
}

function extractRawTextFromXml(xmlSnippet: string): string {
  const tRegex = /<(?:w:t|m:t)(?:\s[^>]*)?>([\s\S]*?)<\/(?:w:t|m:t)>/g;
  let text = '';
  let match: RegExpExecArray | null;
  while ((match = tRegex.exec(xmlSnippet)) !== null) {
    text += match[1];
  }
  return text;
}

function parseParagraphXml(pXml: string, imageDataUrls: Record<string, string>): string {
  const foundImages: string[] = [];

  // Tìm các thẻ chứa hình ảnh (<w:drawing>, <v:shape>, <w:pict>)
  const drawingRegex = /<(?:w:drawing|v:shape|w:pict)(?:\s[^>]*)?>([\s\S]*?)<\/(?:w:drawing|v:shape|w:pict)>/gi;
  let dMatch: RegExpExecArray | null;

  while ((dMatch = drawingRegex.exec(pXml)) !== null) {
    const dXml = dMatch[0];
    let imgUrl = '';

    // 1. Ưu tiên hình ảnh nhị phân nội bộ trích xuất từ file ZIP (r:embed hoặc r:id)
    const rMatch = dXml.match(/(?:r:embed|r:id)="([^"]+)"/i);
    if (rMatch && imageDataUrls[rMatch[1]]) {
      imgUrl = imageDataUrls[rMatch[1]];
    }

    // 2. Nếu không có file ảnh nội bộ, mới dùng đường dẫn ảnh HTTP (descr hoặc src)
    if (!imgUrl) {
      const descrMatch = dXml.match(/(?:descr|src|url)="([^"]*https?:\/\/[^"]+)"/i);
      if (descrMatch) {
        imgUrl = descrMatch[1];
      }
    }

    if (imgUrl && !foundImages.includes(imgUrl)) {
      foundImages.push(imgUrl);
    }
  }

  // Dự phòng trường hợp ảnh r:embed đứng đơn lẻ ngoài container
  if (foundImages.length === 0) {
    const standaloneMatch = pXml.match(/(?:r:embed|r:id)="([^"]+)"/i);
    if (standaloneMatch && imageDataUrls[standaloneMatch[1]]) {
      foundImages.push(imageDataUrls[standaloneMatch[1]]);
    }
  }

  let converted = '';
  const oMathRegex = /<m:oMath(?:\s[^>]*)?>([\s\S]*?)<\/m:oMath>/g;
  let lastIndex = 0;
  let oMatch: RegExpExecArray | null;

  while ((oMatch = oMathRegex.exec(pXml)) !== null) {
    const beforeXml = pXml.substring(lastIndex, oMatch.index);
    converted += extractRawTextFromXml(beforeXml);
    const mathLatex = ommlToLatex(oMatch[0]);
    converted += mathLatex ? ` $${mathLatex}$ ` : '';
    lastIndex = oMathRegex.lastIndex;
  }
  converted += extractRawTextFromXml(pXml.substring(lastIndex));

  let fullParagraph = converted.trim();

  if (foundImages.length > 0) {
    const imgMarkdown = foundImages.map((dataUrl) => `\n![Hình minh họa](${dataUrl})`).join('');
    fullParagraph = fullParagraph ? `${fullParagraph}\n${imgMarkdown}` : imgMarkdown.trim();
  }

  return fullParagraph;
}

function parseTableXml(tblXml: string, imageDataUrls: Record<string, string>): string {
  const trRegex = /<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g;
  let trMatch: RegExpExecArray | null;
  const tableRows: string[] = [];

  while ((trMatch = trRegex.exec(tblXml)) !== null) {
    const trXml = trMatch[1];
    const tcRegex = /<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g;
    let tcMatch: RegExpExecArray | null;
    const cellTexts: string[] = [];

    while ((tcMatch = tcRegex.exec(trXml)) !== null) {
      const tcXml = tcMatch[1];
      // Nếu ô có chứa bảng con
      if (tcXml.includes('<w:tbl')) {
        const nestedTblRegex = /<w:tbl(?:\s[^>]*)?>([\s\S]*?)<\/w:tbl>/g;
        let nestedMatch: RegExpExecArray | null;
        const nestedRes: string[] = [];
        while ((nestedMatch = nestedTblRegex.exec(tcXml)) !== null) {
          nestedRes.push(parseTableXml(nestedMatch[0], imageDataUrls));
        }
        cellTexts.push(nestedRes.join('\n'));
      } else {
        const pRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
        let pMatch: RegExpExecArray | null;
        const pTexts: string[] = [];
        while ((pMatch = pRegex.exec(tcXml)) !== null) {
          const txt = parseParagraphXml(pMatch[1], imageDataUrls);
          if (txt) pTexts.push(txt);
        }
        cellTexts.push(pTexts.join(' '));
      }
    }
    if (cellTexts.some((t) => t.trim())) {
      tableRows.push('| ' + cellTexts.join(' | ') + ' |');
    }
  }

  return tableRows.join('\n');
}

/** Trích xuất toàn bộ đoạn văn, BẢNG BIỂU & HÌNH ẢNH từ .docx và tự động chuyển đổi công thức Toán Word sang LaTeX $...$ */
export async function extractDocxTextWithMath(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 1. Đọc document.xml.rels để map rId -> path file ảnh trong ZIP
    const relsMap: Record<string, string> = {};
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (relsFile) {
      const relsXml = await relsFile.async('string');
      const relRegex = /<Relationship\s+[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/gi;
      let match: RegExpExecArray | null;
      while ((match = relRegex.exec(relsXml)) !== null) {
        const id = match[1];
        let target = match[2];
        if (target.startsWith('media/')) target = 'word/' + target;
        else if (!target.startsWith('word/')) target = 'word/' + target;
        relsMap[id] = target;
      }
    }

    // 2. Chuyển toàn bộ file ảnh trong /media sang Base64 Data URL
    const imageDataUrls: Record<string, string> = {};
    for (const [rId, path] of Object.entries(relsMap)) {
      const imgFile = zip.file(path);
      if (imgFile) {
        const base64 = await imgFile.async('base64');
        const ext = path.split('.').pop()?.toLowerCase() || 'jpeg';
        const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
        imageDataUrls[rId] = `data:${mime};base64,${base64}`;
      }
    }

    // 3. Đọc dữ liệu từ word/document.xml theo thứ tự từng phần tử trong body (Paragraph & Table)
    const docXmlFile = zip.file('word/document.xml');
    if (!docXmlFile) return '';
    const xml = await docXmlFile.async('string');

    const bodyMatch = xml.match(/<w:body(?:\s[^>]*)?>([\s\S]*?)<\/w:body>/);
    if (!bodyMatch) return '';
    const bodyXml = bodyMatch[1];

    const elemRegex = /<(w:p|w:tbl)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
    let elemMatch: RegExpExecArray | null;
    const extractedBlocks: string[] = [];

    while ((elemMatch = elemRegex.exec(bodyXml)) !== null) {
      const tag = elemMatch[1];
      const fullXml = elemMatch[0];

      if (tag === 'w:tbl') {
        const tblStr = parseTableXml(fullXml, imageDataUrls);
        if (tblStr.trim()) extractedBlocks.push(tblStr);
      } else {
        const pStr = parseParagraphXml(elemMatch[2], imageDataUrls);
        if (pStr.trim()) extractedBlocks.push(pStr);
      }
    }

    return extractedBlocks.join('\n');
  } catch (e) {
    console.warn('Lỗi đọc XML file docx bằng JSZip:', e);
    return '';
  }
}

function extractAndCleanImages(rawContent: string): { cleanContent: string; imgUrls: string[] } {
  const imgUrls: string[] = [];
  const imgMarkdownRegex = /!\[(?:[^\]]*)\]\((data:image\/[^;]+;base64,[^\s\)]+|https?:\/\/[^\s\)]+)\)/g;

  let match: RegExpExecArray | null;
  while ((match = imgMarkdownRegex.exec(rawContent)) !== null) {
    if (!imgUrls.includes(match[1])) {
      imgUrls.push(match[1]);
    }
  }

  const cleanContent = rawContent.replace(imgMarkdownRegex, '').trim();
  return { cleanContent, imgUrls };
}

/** Hàm Bóc tách Văn bản Đề thi Thật (Phần 1: Trắc nghiệm 4 đáp án, Phần 2: Đúng/Sai, Phần 3: Trả lời ngắn/Tự luận) */
export function parseExamTextToQuestions(text: string): ParsedQuestionItem[] {
  const result: ParsedQuestionItem[] = [];
  if (!text || !text.trim()) return result;

  // 1. Trích xuất Bảng đáp án tổng hợp ở cuối tài liệu (ví dụ: "ĐÁP ÁN: 1A 2B 3C..." hoặc "1.A 2.B 3.C")
  const answerKeyMap: Record<number, string> = {};
  const answerKeyRegex = /(?:^|\n)(?:ĐÁP\s*ÁN|BẢNG\s*ĐÁP\s*ÁN|KEY|LỜI\s*GIẢI|PHẦN\s*ĐÁP\s*ÁN)[\s\S]*$/i;
  const keySectionMatch = text.match(answerKeyRegex);
  if (keySectionMatch) {
    const keyText = keySectionMatch[0];
    const pairRegex = /(?:Câu\s*)?(\d+)[\s\.\:\-\=]+([A-Ea-e])/g;
    let kMatch: RegExpExecArray | null;
    while ((kMatch = pairRegex.exec(keyText)) !== null) {
      const qNum = parseInt(kMatch[1], 10);
      const ansLetter = kMatch[2].toUpperCase();
      answerKeyMap[qNum] = ansLetter;
    }
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let currentSection = 1; // 1: Trắc nghiệm, 2: Đúng/Sai, 3: Tự luận/Ngắn
  let currentQuestion: Partial<ParsedQuestionItem> | null = null;
  let qCounter = 0;

  const commitQuestion = () => {
    if (!currentQuestion || !currentQuestion.content) return;
    qCounter++;
    let answers = currentQuestion.answers || [];
    let qType: any = currentQuestion.question_type || 'SINGLE_CHOICE';

    const { cleanContent, imgUrls } = extractAndCleanImages(currentQuestion.content);

    // Auto-detect question type: If no options found, switch to ESSAY
    if (qType !== 'ESSAY' && answers.length === 0) {
      qType = 'ESSAY';
    }

    // Assign answer correctness based on Bottom Answer Key Map if available
    const targetKeyLetter = answerKeyMap[qCounter];
    if (targetKeyLetter && answers.length > 0 && qType !== 'ESSAY') {
      answers = answers.map((ans, i) => {
        const letter = String.fromCharCode(65 + i);
        return {
          ...ans,
          is_correct: letter === targetKeyLetter,
        };
      });
    }

    // Auto-detect MULTIPLE_CHOICE if >= 2 answers are correct
    const correctCount = answers.filter((a) => a.is_correct).length;
    if (qType === 'SINGLE_CHOICE' && correctCount > 1) {
      qType = 'MULTIPLE_CHOICE';
    }

    // Fallback: If non-essay has options but no correct answer flagged, mark 1st option as correct
    if (qType !== 'ESSAY' && answers.length > 0 && correctCount === 0) {
      answers = answers.map((ans, i) => ({
        ...ans,
        is_correct: i === 0,
      }));
    }

    const hasCorrect = answers.some((a) => a.is_correct);

    result.push({
      temp_id: `temp-parsed-${qCounter}`,
      question_type: qType,
      content: cleanContent,
      img_urls: imgUrls.length > 0 ? imgUrls : undefined,
      explain: currentQuestion.explain || '',
      points: qType === 'ESSAY' ? 2.0 : 1.0,
      is_valid: qType === 'ESSAY' ? cleanContent.trim() !== '' : (hasCorrect && cleanContent.trim() !== ''),
      validation_errors:
        !cleanContent.trim()
          ? ['Nội dung câu hỏi không được để trống']
          : qType !== 'ESSAY' && !hasCorrect
            ? ['Vui lòng chọn ít nhất 1 đáp án đúng']
            : [],
      answers: answers,
    });
    currentQuestion = null;
  };

  for (const line of lines) {
    // Nhận diện phần
    if (/Phần\s+1/i.test(line)) {
      commitQuestion();
      currentSection = 1;
      continue;
    }
    if (/Phần\s+2/i.test(line)) {
      commitQuestion();
      currentSection = 2;
      continue;
    }
    if (/Phần\s+3/i.test(line)) {
      commitQuestion();
      currentSection = 3;
      continue;
    }

    // Flexible regex matching: "Câu 1.", "Câu 1:", "Bài 1:", "1.", "1)"
    const qMatch =
      line.match(/^(?:Câu|Bài|Câu\s+hỏi)\s*(\d+)[\.:\-\)\s]*\s*(.*)/i) ||
      line.match(/^(\d+)[\.\)]\s+(.*)/);

    if (qMatch) {
      commitQuestion();
      const qNum = qMatch[1];
      const qText = qMatch[2] || '';

      currentQuestion = {
        question_type: currentSection === 2 ? 'TRUE_FALSE' : currentSection === 3 ? 'ESSAY' : 'SINGLE_CHOICE',
        content: `Câu ${qNum}. ${qText}`,
        answers: [],
      };
      continue;
    }

    if (!currentQuestion) {
      // Fallback: If text starts directly without "Câu X", create first question container
      currentQuestion = {
        question_type: 'SINGLE_CHOICE',
        content: line,
        answers: [],
      };
      continue;
    }

    // Bóc tách đáp án A., B., C., D., E. (chấp nhận A., A), a., A:, A/)
    if (currentSection === 1) {
      const isTableLine = line.startsWith('|') && line.endsWith('|');
      const isImgLine = line.includes('![Hình minh họa]');

      const optMatches = Array.from(
        line.matchAll(/(?:^|\s+|\t+)(?:\*|\[x\]\s*)?([A-Ea-e])[\.\:\)\/\-]\s*([\s\S]*?)(?=(?:\s+[A-Ea-e][\.\:\)\/\-]\s*|\t+[A-Ea-e][\.\:\)\/\-]\s*|$))/g)
      );

      if (!isTableLine && !isImgLine && optMatches.length > 0) {
        for (const m of optMatches) {
          const letter = m[1].toUpperCase();
          let contentStr = m[2].trim();
          if (!contentStr) continue;

          contentStr = contentStr.replace(/\t.*$/, '').trim();

          const isStarMarked = m[0].includes('*') || m[0].includes('[x]') || line.toLowerCase().includes(`đáp án: ${letter.toLowerCase()}`);
          const isCorrect = isStarMarked;

          currentQuestion.answers = currentQuestion.answers || [];
          if (!currentQuestion.answers.some((a) => a.content.toUpperCase() === contentStr.toUpperCase())) {
            currentQuestion.answers.push({
              content: contentStr,
              is_correct: isCorrect,
            });
          }
        }
      } else {
        currentQuestion.content += '\n' + line;
      }
    }

    // Bóc tách cho Phần 2: Các ý a), b), c), d) Đúng/Sai
    else if (currentSection === 2) {
      const subMatch = line.match(/^([a-d])[\.\)\:]\s*#?(.*)/i);
      if (subMatch) {
        const subLetter = subMatch[1].toLowerCase();
        const subText = subMatch[2].trim();
        const isTrue = subLetter === 'a' || subLetter === 'c';
        currentQuestion.answers = currentQuestion.answers || [];
        currentQuestion.answers.push({
          content: `${subLetter}) ${subText}`,
          is_correct: isTrue,
        });
      } else {
        currentQuestion.content += '\n' + line;
      }
    }

    // Bóc tách cho Phần 3: Trả lời ngắn / Tự luận [[kq]]
    else if (currentSection === 3) {
      if (line.includes('Trả lời:')) {
        const ansMatch = line.match(/\[\[(.*?)\]\]/);
        const ansVal = ansMatch ? ansMatch[1] : line.replace('Trả lời:', '').trim();
        currentQuestion.explain = `Đáp số chính xác: ${ansVal}`;
        currentQuestion.answers = [{ content: `Đáp số: ${ansVal}`, is_correct: true }];
      } else {
        currentQuestion.content += '\n' + line;
      }
    }
  }
  commitQuestion();

  return result;
}

/** Service quản lý Ngân hàng đề & Import câu hỏi (ERD: QuestionBank → Question → Answer) */
export const questionBankService = {
  /** Danh sách ngân hàng đề của giáo viên (owner_id) */
  async getBanks(ownerId?: string): Promise<QuestionBank[]> {
    await delay();
    if (!ownerId) return MOCK_QUESTION_BANKS.map((b) => ({ ...b }));
    return MOCK_QUESTION_BANKS.filter(
      (b) => b.owner_id === ownerId || b.owner_id === 'tchr-01' || !b.owner_id
    ).map((b) => ({ ...b }));
  },

  async getBank(bankId: string): Promise<QuestionBank | undefined> {
    await delay();
    return MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
  },

  async createBank(payload: {
    title: string;
    owner_id: string;
    subject?: string;
    description?: string;
    is_premium?: boolean;
    school_id?: string;
  }): Promise<QuestionBank> {
    await delay();
    const now = new Date().toISOString();
    const bank: QuestionBank = {
      id: uid('bank'),
      title: payload.title,
      owner_id: payload.owner_id,
      school_id: payload.school_id ?? null,
      is_premium: payload.is_premium ?? false,
      subject: payload.subject ?? null,
      description: payload.description ?? null,
      questions_count: 0,
      count_used: 0,
      created_at: now,
      updated_at: now,
      questions: [],
    };
    MOCK_QUESTION_BANKS.unshift(bank);
    return bank;
  },

  async updateBank(bankId: string, patch: Partial<QuestionBank>): Promise<QuestionBank | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    Object.assign(bank, patch);
    recalcCount(bank);
    return bank;
  },

  /** Bật/tắt ngân hàng Premium (is_premium) */
  async togglePremium(bankId: string, value: boolean): Promise<QuestionBank | undefined> {
    await delay(150);
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    bank.is_premium = value;
    bank.updated_at = new Date().toISOString();
    return bank;
  },

  async updateReviewStatus(
    bankId: string,
    status: QuestionBankReviewStatus,
    reviewNote = '',
    reviewedBy = 'HOD hiện tại'
  ): Promise<QuestionBank | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((item) => item.id === bankId);
    if (!bank) return undefined;
    Object.assign(bank, {
      status,
      review_note: reviewNote,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return bank;
  },

  async deleteBank(bankId: string): Promise<void> {
    await delay();
    const index = MOCK_QUESTION_BANKS.findIndex((b) => b.id === bankId);
    if (index >= 0) MOCK_QUESTION_BANKS.splice(index, 1);
  },

  /** Lưu câu hỏi (thêm mới nếu chưa có id trong bank) */
  async saveQuestion(bankId: string, question: Question): Promise<Question | undefined> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) return undefined;
    bank.questions = bank.questions ?? [];
    const index = bank.questions.findIndex((q) => q.id === question.id);
    if (index >= 0) {
      bank.questions[index] = question;
    } else {
      bank.questions.push(question);
    }
    recalcCount(bank);
    return question;
  },

  async deleteQuestion(bankId: string, questionId: string): Promise<void> {
    await delay();
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank?.questions) return;
    bank.questions = bank.questions.filter((q) => q.id !== questionId);
    recalcCount(bank);
  },

  /** Bóc tách THẬT từ File Word / File Excel / Text người dùng upload (Bao gồm cả công thức toán MathType) */
  async parseImportFile(file: File, fileType: 'WORD' | 'EXCEL', customText?: string): Promise<ParseImportResult> {
    await delay(300);

    let rawText = customText || '';

    // Đọc văn bản THẬT bao gồm cả các thẻ công thức toán <m:t> từ file .docx
    if (!rawText && file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        rawText = await extractDocxTextWithMath(arrayBuffer);

        if (!rawText.trim()) {
          const res = await mammoth.extractRawText({ arrayBuffer });
          rawText = res.value || '';
        }
      } catch (err) {
        console.warn('Không thể đọc file Word trực tiếp từ trình duyệt:', err);
      }
    }

    const parsedItems: ParsedQuestionItem[] = parseExamTextToQuestions(rawText);

    const validCount = parsedItems.filter((i) => i.is_valid).length;
    const invalidCount = parsedItems.length - validCount;

    return {
      summary: {
        total_parsed: parsedItems.length,
        valid_count: validCount,
        invalid_count: invalidCount,
      },
      parsed_questions: parsedItems,
      raw_text: rawText,
    };
  },

  /** Lưu hàng loạt câu hỏi từ Import vào Ngân hàng đề */
  async batchImportQuestions(
    bankId: string,
    questions: ParsedQuestionItem[]
  ): Promise<{ imported_count: number; bank_id: string }> {
    await delay(300);
    const bank = MOCK_QUESTION_BANKS.find((b) => b.id === bankId);
    if (!bank) throw new Error('Ngân hàng đề không tồn tại');

    bank.questions = bank.questions ?? [];
    const validItems = questions.filter((q) => q.is_valid);
    let count = 0;

    for (const item of validItems) {
      const q: Question = {
        id: uid('q'),
        bank_id: bankId,
        type: item.question_type,
        content: item.content,
        img_urls: item.img_urls,
        points: item.points || 1.0,
        created_at: new Date().toISOString(),
        answers: item.answers.map((ans, idx) => ({
          id: uid('ans'),
          question_id: 'q-new',
          content: ans.content,
          is_answer: ans.is_correct,
          order_index: idx,
        })),
      };
      bank.questions.push(q);
      count++;
    }

    recalcCount(bank);
    return { imported_count: count, bank_id: bankId };
  },
};

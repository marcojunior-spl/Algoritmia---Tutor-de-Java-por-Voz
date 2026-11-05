import { ChatMessage } from '../components/VoiceSessionPanel';
import { CodeSnippetItem } from '../components/CodeWhiteboard';
import { SavedSnippet } from '../types';

export function exportSessionToMarkdown(params: {
  title: string;
  date: string;
  durationFormatted: string;
  level: string;
  mode: string;
  voice: string;
  messages: ChatMessage[];
  codeSnippets: CodeSnippetItem[];
}): void {
  const {
    title,
    date,
    durationFormatted,
    level,
    mode,
    voice,
    messages,
    codeSnippets,
  } = params;

  let md = `# ${title || 'Sessão de Estudo - Algoritmia'}\n\n`;
  md += `> **Data:** ${date}  \n`;
  md += `> **Duração:** ${durationFormatted}  \n`;
  md += `> **Nível:** ${level} | **Modo:** ${mode} | **Voz:** ${voice}  \n`;
  md += `> **Total de intervenções:** ${messages.length}\n\n`;
  md += `---\n\n`;

  if (codeSnippets.length > 0) {
    md += `## 💻 Código Java & Análise da Lousa\n\n`;
    for (const snippet of codeSnippets) {
      md += `### ${snippet.title}\n\n`;
      if (snippet.explanation) {
        md += `*${snippet.explanation}*\n\n`;
      }
      md += `- **Tempo:** \`${snippet.complexityTime}\`\n`;
      md += `- **Espaço:** \`${snippet.complexitySpace}\`\n`;
      if (snippet.javaStandardClass) {
        md += `- **Biblioteca Padrão:** \`${snippet.javaStandardClass}\`\n`;
      }
      md += `\n\`\`\`java\n${snippet.code}\n\`\`\`\n\n`;
    }
    md += `---\n\n`;
  }

  md += `## 🎙️ Transcrição Completa da Conversa\n\n`;
  for (const msg of messages) {
    const speaker = msg.sender === 'user' ? '🧑 Aluno' : '👨‍🏫 Tutor Java';
    md += `### ${speaker} (${msg.timestamp})\n`;
    if (msg.isInterrupted) {
      md += `*[Interrompido pelo aluno]*  \n`;
    }
    md += `${msg.text}\n\n`;
  }

  md += `---\n*Gerado pelo Algoritmia - Tutor de Java por Voz*\n`;

  downloadBlob(md, `algoritmia-sessao-${slugify(title || 'estudo')}.md`);
}

export function exportSnippetLibraryToMarkdown(snippets: SavedSnippet[]): void {
  let md = `# 📚 Biblioteca de Snippets Java - Algoritmia\n\n`;
  md += `> **Total de Snippets:** ${snippets.length}  \n`;
  md += `> **Exportado em:** ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
  md += `---\n\n`;

  for (let i = 0; i < snippets.length; i++) {
    const s = snippets[i];
    md += `## ${i + 1}. ${s.title}\n\n`;
    if (s.tags && s.tags.length > 0) {
      md += `**Tags:** ${s.tags.map((t) => `\`${t}\``).join(' · ')}  \n`;
    }
    md += `**Complexidade de Tempo:** \`${s.complexityTime}\` | **Espaço:** \`${s.complexitySpace}\`  \n`;
    if (s.javaStandardClass) {
      md += `**Equivalente na Standard Library:** \`${s.javaStandardClass}\`  \n`;
    }
    md += `**Salvo em:** ${s.formattedDate}\n\n`;

    if (s.explanation) {
      md += `> ${s.explanation}\n\n`;
    }

    md += `\`\`\`java\n${s.code}\n\`\`\`\n\n`;
    md += `---\n\n`;
  }

  downloadBlob(md, `biblioteca-snippets-java-${new Date().toISOString().slice(0, 10)}.md`);
}

function downloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)
    .replace(/^-+|-+$/g, '');
}

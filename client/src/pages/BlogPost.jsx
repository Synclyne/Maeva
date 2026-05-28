import { useParams, Link } from 'react-router-dom';
import { getBlogPost, blogPosts } from '../data/blog';
import { useSEO } from '../hooks/useSEO';

/* Very lightweight markdown renderer — supports headings, bold, tables, blockquotes, lists */
function SimpleMarkdown({ content }) {
  const lines = content.trim().split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Table
    if (line.includes('|') && lines[i + 1]?.includes('---')) {
      const headers = line.split('|').map(h => h.trim()).filter(Boolean);
      const rows = [];
      i += 2; // skip separator
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map(c => c.trim()).filter(Boolean));
        i++;
      }
      elements.push(
        <div key={i} className="overflow-x-auto my-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((h, j) => (
                  <th key={j} className="text-left px-4 py-2 font-semibold text-gray-700 border border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-gray-600 border border-gray-200">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-display text-xl font-bold text-gray-900 mt-8 mb-3">{inline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-semibold text-gray-800 mt-5 mb-2">{inline(line.slice(4))}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-4 border-primary pl-4 py-1 my-4 bg-primary/5 rounded-r-lg">
          <p className="text-gray-700 text-sm italic">{inline(line.slice(2))}</p>
        </blockquote>
      );
    } else if (line.startsWith('- **')) {
      elements.push(
        <li key={i} className="text-gray-600 text-sm mb-1 flex items-start gap-2">
          <span className="text-primary mt-1 shrink-0">•</span>
          <span>{inline(line.slice(2))}</span>
        </li>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="text-gray-600 text-sm mb-1 flex items-start gap-2">
          <span className="text-gray-400 mt-1 shrink-0">•</span>
          <span>{inline(line.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      elements.push(
        <li key={i} className="text-gray-600 text-sm mb-1 flex items-start gap-2">
          <span className="text-primary font-bold shrink-0 w-5">{num}.</span>
          <span>{inline(line.replace(/^\d+\. /, ''))}</span>
        </li>
      );
    } else {
      elements.push(<p key={i} className="text-gray-600 leading-relaxed mb-3">{inline(line)}</p>);
    }

    i++;
  }

  return <div className="prose-custom">{elements}</div>;
}

function inline(text) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>
      : part
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  useSEO({
    title: post ? `${post.title} | Maeva Kenya` : 'Blog Post | Maeva Kenya',
    description: post?.excerpt || '',
    image: post?.image || '',
    type: 'article',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  if (!post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📰</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Post not found</h1>
          <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const related = blogPosts.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-500 text-base mb-4">{post.excerpt}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              M
            </div>
            <div>
              <div className="font-medium text-gray-700">{post.author}</div>
              <div className="text-xs">
                {new Date(post.date).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}
                <span className="mx-1.5">·</span>{post.readTime}
              </div>
            </div>
          </div>
        </header>

        {/* Cover image */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
          <img src={post.image} alt={post.title} className="w-full h-56 sm:h-72 object-cover" />
        </div>

        {/* Content */}
        <article className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <SimpleMarkdown content={post.content} />
        </article>

        {/* Share */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Share this article</p>
          <div className="flex gap-2 flex-wrap">
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' — ' + window.location.href)}`}
              target="_blank" rel="noreferrer"
              className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-medium">
              WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank" rel="noreferrer"
              className="text-xs bg-sky-500 text-white px-3 py-2 rounded-lg font-medium">
              Twitter / X
            </a>
            <button onClick={() => navigator.clipboard.writeText(window.location.href).then(() => {})}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-medium">
              Copy Link
            </button>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(rp => (
                <Link key={rp.slug} to={`/blog/${rp.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex">
                  <img src={rp.image} alt={rp.title}
                    className="w-24 h-full object-cover group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                    style={{ minHeight: '80px' }} />
                  <div className="p-3">
                    <p className="text-xs font-medium text-primary mb-1">{rp.category}</p>
                    <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">{rp.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{rp.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link to="/blog" className="text-primary hover:underline text-sm font-medium">← Back to all articles</Link>
        </div>
      </div>
    </div>
  );
}

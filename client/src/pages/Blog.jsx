import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { useSEO } from '../hooks/useSEO';

export default function Blog() {
  useSEO({
    title: 'Market Insights & Property News | Maeva Kenya',
    description: 'Expert guides, market data, and investment insights for Kenya real estate buyers, sellers, and investors.',
  });

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Market Insights
          </h1>
          <p className="text-gray-500 text-lg">
            Expert guides, market data, and investment insights for Kenya real estate.
          </p>
        </div>

        {/* Featured post */}
        <div className="mb-8">
          <Link to={`/blog/${blogPosts[0].slug}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="relative h-56 sm:h-72 overflow-hidden">
              <img src={blogPosts[0].image} alt={blogPosts[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="text-xs font-semibold bg-primary text-white px-3 py-1 rounded-full mb-2 inline-block">
                  {blogPosts[0].category}
                </span>
                <h2 className="text-white font-display text-xl sm:text-2xl font-bold leading-tight mt-2">
                  {blogPosts[0].title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
                  <span>{blogPosts[0].author}</span>
                  <span>·</span>
                  <span>{new Date(blogPosts[0].date).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}</span>
                  <span>·</span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {blogPosts.slice(1).map(post => (
            <Link key={post.slug} to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={post.image} alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-primary mb-2">{post.category}</span>
                <h2 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>{new Date(post.date).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

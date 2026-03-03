import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';

interface SocialPlatform {
  name: string;
  followers?: number;
  mentions?: number;
  sentiment?: number;
  trending?: string[];
}

interface SocialDashboard {
  platforms?: SocialPlatform[];
  totalReach?: number;
  positiveSentiment?: number;
  recentPosts?: Array<{ platform: string; content: string; engagement: number; date: string }>;
  summary?: string;
}

export default function Social() {
  const { data: rawData, loading } = useApi(() => dashboardApi.socialMedia(), []);
  const data = rawData as SocialDashboard | null;

  const platforms = data?.platforms ?? [];
  const posts = data?.recentPosts ?? [];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Réseaux sociaux</h1>
      </div>

      {loading ? <div className="loading">Chargement…</div> : (
        <>
          {data?.summary && <div className="summary-box">{data.summary}</div>}

          <div className="kpi-row">
            {data?.totalReach !== undefined && (
              <div className="kpi-card">
                <div className="kpi-label">Portée totale</div>
                <div className="kpi-value">{data.totalReach.toLocaleString('fr-FR')}</div>
              </div>
            )}
            {data?.positiveSentiment !== undefined && (
              <div className="kpi-card">
                <div className="kpi-label">Sentiment positif</div>
                <div className="kpi-value" style={{ color: '#10b981' }}>{data.positiveSentiment}%</div>
              </div>
            )}
          </div>

          {platforms.length > 0 && (
            <>
              <h2 className="section-title">Plateformes</h2>
              <div className="platforms-grid">
                {platforms.map((p, i) => (
                  <div key={i} className="platform-card">
                    <div className="platform-name">{p.name}</div>
                    {p.followers !== undefined && <div className="platform-stat"><span>Abonnés</span><strong>{p.followers.toLocaleString('fr-FR')}</strong></div>}
                    {p.mentions !== undefined && <div className="platform-stat"><span>Mentions</span><strong>{p.mentions}</strong></div>}
                    {p.sentiment !== undefined && (
                      <div className="sentiment-bar">
                        <div className="sentiment-fill" style={{ width: `${p.sentiment}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {posts.length > 0 && (
            <>
              <h2 className="section-title">Publications récentes</h2>
              <div className="posts-list">
                {posts.map((post, i) => (
                  <div key={i} className="post-card">
                    <div className="post-header">
                      <span className="post-platform">{post.platform}</span>
                      <span className="post-date">{new Date(post.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="post-content">{post.content}</div>
                    <div className="post-engagement">👍 {post.engagement} interactions</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {platforms.length === 0 && posts.length === 0 && (
            <div className="empty-state">Aucune donnée sociale disponible.</div>
          )}
        </>
      )}

      <style>{`
        .page-content { padding: 24px; }
        .page-header { margin-bottom: 24px; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .loading, .empty-state { color: #9ca3af; padding: 40px; text-align: center; }
        .summary-box { background: #1c2333; border-left: 3px solid #2563eb; padding: 12px 16px; color: #d1d5db; font-size: 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
        .kpi-card { background: #1c2333; border-radius: 10px; padding: 16px 20px; border: 1px solid #1f2937; }
        .kpi-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .kpi-value { font-size: 24px; font-weight: 700; color: #f1f5f9; }
        .section-title { font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; }
        .platforms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .platform-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .platform-name { font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
        .platform-stat { display: flex; justify-content: space-between; font-size: 13px; color: #9ca3af; margin-bottom: 4px; }
        .platform-stat strong { color: #f1f5f9; }
        .sentiment-bar { height: 4px; background: #1f2937; border-radius: 2px; margin-top: 8px; }
        .sentiment-fill { height: 100%; background: #10b981; border-radius: 2px; }
        .posts-list { display: flex; flex-direction: column; gap: 10px; }
        .post-card { background: #1c2333; border-radius: 10px; padding: 14px; border: 1px solid #1f2937; }
        .post-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .post-platform { color: #60a5fa; font-size: 12px; font-weight: 600; }
        .post-date { color: #6b7280; font-size: 12px; }
        .post-content { color: #d1d5db; font-size: 14px; margin-bottom: 6px; }
        .post-engagement { color: #6b7280; font-size: 12px; }
      `}</style>
    </div>
  );
}

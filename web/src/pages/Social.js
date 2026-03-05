import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useApi } from '../hooks/useApi.js';
import { dashboardApi } from '../api/dashboard.api.js';
export default function Social() {
    const { data: rawData, loading } = useApi(() => dashboardApi.socialMedia(), []);
    const data = rawData;
    const platforms = data?.platforms ?? [];
    const posts = data?.recentPosts ?? [];
    return (_jsxs("div", { className: "page-content", children: [_jsx("div", { className: "page-header", children: _jsx("h1", { children: "R\u00E9seaux sociaux" }) }), loading ? _jsx("div", { className: "loading", children: "Chargement\u2026" }) : (_jsxs(_Fragment, { children: [data?.summary && _jsx("div", { className: "summary-box", children: data.summary }), _jsxs("div", { className: "kpi-row", children: [data?.totalReach !== undefined && (_jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Port\u00E9e totale" }), _jsx("div", { className: "kpi-value", children: data.totalReach.toLocaleString('fr-FR') })] })), data?.positiveSentiment !== undefined && (_jsxs("div", { className: "kpi-card", children: [_jsx("div", { className: "kpi-label", children: "Sentiment positif" }), _jsxs("div", { className: "kpi-value", style: { color: '#10b981' }, children: [data.positiveSentiment, "%"] })] }))] }), platforms.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "section-title", children: "Plateformes" }), _jsx("div", { className: "platforms-grid", children: platforms.map((p, i) => (_jsxs("div", { className: "platform-card", children: [_jsx("div", { className: "platform-name", children: p.name }), p.followers !== undefined && _jsxs("div", { className: "platform-stat", children: [_jsx("span", { children: "Abonn\u00E9s" }), _jsx("strong", { children: p.followers.toLocaleString('fr-FR') })] }), p.mentions !== undefined && _jsxs("div", { className: "platform-stat", children: [_jsx("span", { children: "Mentions" }), _jsx("strong", { children: p.mentions })] }), p.sentiment !== undefined && (_jsx("div", { className: "sentiment-bar", children: _jsx("div", { className: "sentiment-fill", style: { width: `${p.sentiment}%` } }) }))] }, i))) })] })), posts.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h2", { className: "section-title", children: "Publications r\u00E9centes" }), _jsx("div", { className: "posts-list", children: posts.map((post, i) => (_jsxs("div", { className: "post-card", children: [_jsxs("div", { className: "post-header", children: [_jsx("span", { className: "post-platform", children: post.platform }), _jsx("span", { className: "post-date", children: new Date(post.date).toLocaleDateString('fr-FR') })] }), _jsx("div", { className: "post-content", children: post.content }), _jsxs("div", { className: "post-engagement", children: ["\uD83D\uDC4D ", post.engagement, " interactions"] })] }, i))) })] })), platforms.length === 0 && posts.length === 0 && (_jsx("div", { className: "empty-state", children: "Aucune donn\u00E9e sociale disponible." }))] })), _jsx("style", { children: `
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
      ` })] }));
}

import { useNavigate } from "react-router-dom";

export default function PlaceholderPage({ title, description }) {
  const navigate = useNavigate();

  return (
    <main className="placeholder-page">
      <section className="placeholder-card">
        <p className="placeholder-card__eyebrow">migration in progress</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="hero-card__actions">
          <button className="primary-button" type="button" onClick={() => navigate(-1)}>
            이전 화면으로
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate("/posts")}>
            목록으로
          </button>
        </div>
      </section>
    </main>
  );
}

export default function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || subtitle) && <div className="section-card-heading"><div>{title && <h3>{title}</h3>}{subtitle && <p>{subtitle}</p>}</div></div>}
      {children}
    </section>
  );
}
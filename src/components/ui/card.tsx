interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-iwb-lg bg-white shadow-iwb-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

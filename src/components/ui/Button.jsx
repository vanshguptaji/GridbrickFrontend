export function Button({ children, onClick, kind = "", disabled = false }) {
  return (
    <button className={`button ${kind}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

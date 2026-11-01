/** Shows post text safely: blank lines make paragraphs, web addresses become links. */
export default function PostBody({ text }: { text: string }) {
  return (
    <div className="post-body">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split(/(https?:\/\/[^\s]+)/g).map((part, j) =>
            /^https?:\/\//.test(part)
              ? <a key={j} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
              : part.split("\n").map((line, k, arr) => <span key={`${j}-${k}`}>{line}{k < arr.length - 1 && <br />}</span>)
          )}
        </p>
      ))}
    </div>
  );
}

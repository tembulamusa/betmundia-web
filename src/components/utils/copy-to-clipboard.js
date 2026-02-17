import { useState } from "react";

const ClipboardCopy = ({ copyText }) => {

  const [isCopied, setIsCopied] = useState(false);
  const copyTextToClipboard = async (text) => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.write(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const handleCopyClick = () => {
    copyTextToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 10000);
      })
      .catch((err) => {
      });
  }

  return (
    <div className="row">
      <div className="col-10 ">
        <input type="text" className="disabled form-control std-input" style={{ width: "100%" }} value={copyText} readOnly />
      </div>
      <div className="col-2">
        <button onClick={handleCopyClick} style={{ background: "#a71f66", color: "#fff", padding: "2px 10px" }}>
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
export default ClipboardCopy;

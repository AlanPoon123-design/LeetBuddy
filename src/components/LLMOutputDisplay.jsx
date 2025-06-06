import { useState, useEffect, useRef, useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism, Highlight, themes } from '../utils/prism-languages';
import remarkGfm from "remark-gfm";
import { FaCopy } from "react-icons/fa6";

// Memoized code block component using prism-react-renderer
const CodeBlock = memo(({ language, children, onCopy, copySuccess }) => {
  const code = String(children).trim();
  
  return (
    <div className="code-block-container mt-2 mb-2">
      <div className="code-block-header flex justify-between items-center p-2">
        <div className="text-xs">{language}</div>
        <button
          onClick={() => onCopy(code)}
          className="copy-button rounded-sm text-xs flex items-center gap-1"
        >
          <FaCopy className="text-xs" />
          <p className="text-xs">
            {!copySuccess ? "Copy" : copySuccess}
          </p>
        </button>
      </div>
      <Highlight
        prism={Prism}
        theme={themes.vsDark}
        code={code}
        language={language || "text"}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre 
            className={`${className}`}
            style={{ ...style, margin: 0, padding: '0.75rem', overflow: 'auto' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
});

// Memoized inline code component
const InlineCode = memo(({ children, className }) => (
  <code className={className || "px-1.5 py-0.5 mx-0.5 bg-gray-900 rounded-sm text-sm"}>
    {children}
  </code>
));

// Check if message was previously being animated
const getLastAnimatedMessage = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lastAnimatedMessage'], (result) => {
        resolve(result.lastAnimatedMessage || null);
      });
    });
  } else {
    return Promise.resolve(localStorage.getItem('lastAnimatedMessage'));
  }
};

// Store the message being animated
const setLastAnimatedMessage = (message) => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ lastAnimatedMessage: message });
  } else {
    localStorage.setItem('lastAnimatedMessage', message);
  }
};

const LLMOutputDisplay = ({ output = "", isNewMessage = false }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const typewriterRef = useRef(null);
  const chunkSize = 1; // Number of words to process in each chunk

  useEffect(() => {
    if (!output) {
      setDisplayedText("");
      return;
    }

    const sanitizedOutput = String(output).replace(/undefined/g, "").trim();
    
    if (!sanitizedOutput) {
      setDisplayedText("");
      return;
    }

    if (!isNewMessage) {
      setDisplayedText(sanitizedOutput);
      setIsTyping(false);
      return;
    }

    // Check if this message was previously being animated
    getLastAnimatedMessage().then(lastMessage => {
      if (lastMessage === sanitizedOutput) {
        // If it matches the last animated message, show it without animation
        setDisplayedText(sanitizedOutput);
        setIsTyping(false);
      } else {
        // Otherwise animate it and store it
        setLastAnimatedMessage(sanitizedOutput);
        animateText(sanitizedOutput);
      }
    });

  }, [output, isNewMessage]);

  const animateText = (text) => {
    setIsTyping(true);
    setDisplayedText("");
    
    const words = text.match(/(\s*[^\s]+|\n+|\s+)/g) || [];
    let currentText = "";
    let currentIndex = 0;

    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    // Process initial chunk
    if (words.length > 0) {
      const initialChunk = words.slice(0, Math.min(chunkSize, words.length)).join('');
      currentText = initialChunk;
      setDisplayedText(currentText);
      currentIndex = chunkSize;
    }

    // Process remaining text in chunks
    typewriterRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        const nextChunkEnd = Math.min(currentIndex + chunkSize, words.length);
        const chunk = words.slice(currentIndex, nextChunkEnd).join('');
        currentText += chunk;
        setDisplayedText(currentText);
        currentIndex = nextChunkEnd;
      } else {
        clearInterval(typewriterRef.current);
        setIsTyping(false);
      }
    }, 20); // Increased interval for chunk processing

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => setCopySuccess("Copied!"),
      (err) => setCopySuccess("Failed")
    );
    setTimeout(() => setCopySuccess(""), 4000);
  };

  // Memoize markdown components
  const components = useMemo(() => ({
    p: memo(({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    )),
    ul: memo(({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>
    )),
    ol: memo(({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
    )),
    li: memo(({ children }) => (
      <li className="mb-1">{children}</li>
    )),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          onCopy={copyToClipboard}
          copySuccess={copySuccess}
        >
          {children}
        </CodeBlock>
      ) : (
        <InlineCode className={className} {...props}>
          {children}
        </InlineCode>
      );
    },
  }), [copySuccess]);

  return (
    <div className={`transition-opacity duration-200 ${isTyping ? 'opacity-90' : 'opacity-100'}`}>
      <ReactMarkdown
        children={displayedText}
        className="space-y-4"
        components={components}
        remarkPlugins={[remarkGfm]}
      />
    </div>
  );
};

export default memo(LLMOutputDisplay);

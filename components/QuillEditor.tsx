import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './QuillEditor.css';

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  modules?: Record<string, unknown>;
  className?: string;
};

const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange, modules, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: modules || {
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote'],
          ['clean'],
        ],
      },
    });

    quillRef.current.on('text-change', () => {
      if (!quillRef.current || isUpdatingRef.current) return;
      onChange(quillRef.current.root.innerHTML);
    });

    quillRef.current.root.innerHTML = value || '<p><br></p>';
  }, [modules, onChange, value]);

  useEffect(() => {
    if (!quillRef.current) return;
    const current = quillRef.current.root.innerHTML;
    if (current !== value) {
      isUpdatingRef.current = true;
      quillRef.current.root.innerHTML = value || '<p><br></p>';
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div ref={containerRef} className={`quill-pro ${className || ''}`.trim()}>
      <div ref={editorRef} />
    </div>
  );
};

export default QuillEditor;

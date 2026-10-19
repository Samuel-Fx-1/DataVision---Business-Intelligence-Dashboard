'use client';

export default function ChatButton() {
  return (
    <button
      type="button"
      className="chat-button"
      aria-label="Open chat"
      onClick={() => {
        alert('Chat feature coming soon!\n\nThis would typically open a live chat widget for customer support.');
      }}
    >
      <i className="fas fa-comment-dots" />
    </button>
  );
}
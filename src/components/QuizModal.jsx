import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'genre',
    label: '1. Favorite genre?',
    options: [
      { value: 'action', label: 'Action' },
      { value: 'romance', label: 'Romance' },
      { value: 'comedy', label: 'Comedy' },
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'horror', label: 'Horror' },
    ],
  },
  {
    id: 'length',
    label: '2. Preferred length?',
    options: [
      { value: 'short', label: 'Short <12 eps' },
      { value: 'medium', label: 'Medium 13-26 eps' },
      { value: 'long', label: 'Long 27+ eps' },
    ],
  },
  {
    id: 'era',
    label: '3. Era?',
    options: [
      { value: 'classic', label: 'Classic pre-2000' },
      { value: 'modern', label: 'Modern 2000-2015' },
      { value: 'recent', label: 'Recent 2016-2025' },
      { value: 'future', label: '2026+' },
    ],
  },
  {
    id: 'mood',
    label: '4. Mood?',
    options: [
      { value: 'exciting', label: 'Exciting' },
      { value: 'relaxing', label: 'Relaxing' },
      { value: 'dark', label: 'Dark' },
      { value: 'wholesome', label: 'Wholesome' },
    ],
  },
  {
    id: 'popularity',
    label: '5. Popularity preference?',
    options: [
      { value: 'mainstream', label: 'Mainstream' },
      { value: 'hidden', label: 'Hidden gem' },
      { value: 'balanced', label: 'Balanced' },
    ],
  },
];

const INITIAL_ANSWERS = {
  genre: '',
  length: '',
  era: '',
  mood: '',
  popularity: '',
};

function QuizModal({ isLoading, onClose, onSubmit }) {
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);

  const isComplete = Object.values(answers).every(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isComplete || isLoading) {
      return;
    }

    onSubmit(answers);
  };

  return (
    <dialog open className="quiz-modal">
      <form className="quiz-modal__form" onSubmit={handleSubmit}>
        <h2>Anime4U Quiz</h2>
        <p>Answer all five questions to build your personalized recommendations.</p>

        <div className="quiz-modal__grid">
          {QUESTIONS.map((question) => (
            <fieldset key={question.id} className="quiz-modal__question">
            <legend>{question.label}</legend>

            {question.options.map((option) => (
              <label key={option.value} className="quiz-option">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={(event) => {
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [question.id]: event.target.value,
                    }));
                  }}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          ))}
        </div>

        <div className="search-panel__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
          <button
            type="submit"
            className="button"
            disabled={!isComplete || isLoading}
          >
            {isLoading ? 'Loading...' : 'Get My Recommendations'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default QuizModal;

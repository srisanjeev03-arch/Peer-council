import './CrisisResources.css';

const RESOURCES = [
  {
    category: 'Emergency',
    helplines: [
      {
        name: 'National Suicide Prevention Lifeline',
        number: '1800-5990019',
        description: '24/7 free and confidential support for people in distress',
        available: '24/7',
      },
      {
        name: 'Crisis Text Line',
        number: 'Text HOME to 
          ',
        description: 'Free, 24/7 crisis support via text message',
        available: '24/7',
      },
    ],
  },
  {
    category: 'Mental Health',
    helplines: [
      {
        name: 'NAMI Helpline',
        number: '1-800-950-NAMI (6264)',
        description: 'National Alliance on Mental Illness - information and support',
        available: 'Mon-Fri 10am-10pm ET',
      },
      {
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        description: 'Substance abuse and mental health services',
        available: '24/7',
      },
    ],
  },
  {
    category: 'Student Support',
    helplines: [
      {
        name: 'Student Mental Health Crisis Line',
        number: '1-877-726-4727',
        description: 'Crisis support specifically for students',
        available: '24/7',
      },
      {
        name: 'The Steve Fund Crisis Text Line',
        number: 'Text STEVE to 741741',
        description: 'Mental health support for young people of color',
        available: '24/7',
      },
    ],
  },
  {
    category: 'Anxiety & Stress',
    helplines: [
      {
        name: 'Anxiety and Depression Association',
        number: '240-485-1001',
        description: 'Resources and support for anxiety disorders',
        available: 'Mon-Fri 9am-5pm ET',
      },
      {
        name: 'Disaster Distress Helpline',
        number: '1-800-985-5990',
        description: 'Support for stress and anxiety during difficult times',
        available: '24/7',
      },
    ],
  },
];

const WARNING_SIGNS = [
  'Thoughts of self-harm or suicide',
  'Feeling hopeless or having no reason to live',
  'Feeling trapped or in unbearable pain',
  'Being a burden to others',
  'Increased use of alcohol or drugs',
  'Acting anxious or agitated',
  'Withdrawing from family and friends',
  'Dramatic mood changes',
  'Sleeping too little or too much',
];

export default function CrisisResources() {
  return (
    <div className="crisis-resources">
      <div className="crisis-header">
        <h2>Crisis Resources & Support</h2>
        <p>You are not alone. Help is available 24/7.</p>
      </div>

      <div className="emergency-alert">
        <div className="alert-icon">⚠️</div>
        <div className="alert-content">
          <h3>In an Emergency</h3>
          <p>
            If you or someone you know is in immediate danger, call <strong>911</strong> or go to the nearest emergency room.
          </p>
        </div>
      </div>

      <div className="quick-access">
        <h3>Quick Access</h3>
        <div className="quick-buttons">
          <a href="tel:988" className="quick-button emergency">
            <span className="button-icon">📞</span>
            <span className="button-text">
              <strong>988</strong>
              <small>Suicide & Crisis Lifeline</small>
            </span>
          </a>
          <a href="sms:741741&body=HOME" className="quick-button">
            <span className="button-icon">💬</span>
            <span className="button-text">
              <strong>Text HOME to 741741</strong>
              <small>Crisis Text Line</small>
            </span>
          </a>
        </div>
      </div>

      {RESOURCES.map((category) => (
        <div key={category.category} className="resource-category">
          <h3>{category.category}</h3>
          <div className="helplines-grid">
            {category.helplines.map((helpline) => (
              <div key={helpline.name} className="helpline-card">
                <h4>{helpline.name}</h4>
                <div className="helpline-number">{helpline.number}</div>
                <p>{helpline.description}</p>
                <div className="helpline-available">
                  <span className="available-badge">{helpline.available}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="warning-signs">
        <h3>Warning Signs to Watch For</h3>
        <p>If you or someone you know is experiencing any of these signs, please reach out for help:</p>
        <ul>
          {WARNING_SIGNS.map((sign, index) => (
            <li key={index}>{sign}</li>
          ))}
        </ul>
      </div>

      <div className="self-care-tips">
        <h3>Immediate Self-Care Steps</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">🧘</span>
            <h4>Breathe</h4>
            <p>Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">💧</span>
            <h4>Stay Hydrated</h4>
            <p>Drink water and eat something if you haven't recently.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🤝</span>
            <h4>Reach Out</h4>
            <p>Contact a trusted friend, family member, or use the helplines above.</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🏃</span>
            <h4>Move Your Body</h4>
            <p>Take a short walk or do gentle stretches to release tension.</p>
          </div>
        </div>
      </div>

      <div className="privacy-reminder">
        <p>
          Remember: All conversations with these helplines are confidential and provided by trained professionals who care about your wellbeing.
        </p>
      </div>
    </div>
  );
}

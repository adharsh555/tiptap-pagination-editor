export const LEGAL_TEMPLATES = [
    {
        id: 'i-140-cover',
        name: 'Form I-140 Cover Letter',
        description: 'Immigrant Petition for Alien Worker cover letter structure.',
        content: `
      <h1>COVER LETTER: FORM I-140 PETITION</h1>
      <p>January 9, 2026</p>
      <p>USCIS<br>Attn: I-140 Premium Processing Case<br>P.O. Box 660867<br>Dallas, TX 75266</p>
      
      <p><strong>RE: Immigrant Petition for Alien Worker (Form I-140)</strong><br>
      Petitioner: OpenSphere Immigration Services<br>
      Beneficiary: [Candidate Name]</p>

      <p>Dear Immigration Officer,</p>

      <p>This letter is submitted in support of the Form I-140 petition filed by OpenSphere Immigration Services on behalf of the Beneficiary for the position of Senior Legal Architect. After thorough internal review, we have determined that the Beneficiary qualifies as an individual of extraordinary ability based on the following criteria:</p>

      <ul>
        <li>Significant contributions to the field of legal workflow automation.</li>
        <li>Peer-reviewed publications in major judicial technology journals.</li>
        <li>Lead consultancy roles in multi-national document compliance projects.</li>
      </ul>

      <p>We kindly request your review of the enclosed documentation. Please do not hesitate to reach out if additional evidence is required for your determination.</p>

      <p>Sincerely,</p>
      <p>[Principal Partner Name]<br>OpenSphere Immigration Services</p>
    `
    },
    {
        id: 'support-letter',
        name: 'General Support Letter',
        description: 'A standard framework for expert support and recommendation letters.',
        content: `
      <h1>LETTER OF SUPPORT</h1>
      <p>Date: [Current Date]</p>
      <p>To Whom It May Concern,</p>

      <p>I am writing this letter to express my strong support for [Name of Applicant] in their application for [Type of Visa/Benefit]. Having worked closely with the applicant for [Number] years in my capacity as [Your Position], I can personally attest to their professional excellence and high standing in the field of [Field].</p>

      <p>During their tenure at [Organization], [Name of Applicant] demonstrated exceptional skills in:</p>
      <ul>
        <li>[Achievement/Skill 1]</li>
        <li>[Achievement/Skill 2]</li>
        <li>[Achievement/Skill 3]</li>
      </ul>

      <p>The applicant's work has had a significant impact on our operations, particularly [Specific Example]. Their removal or absence would constitute a significant loss to the industry.</p>

      <p>I recommend [Name of Applicant] without reservation.</p>

      <p>Respectfully submitted,</p>
      <p>[Your Signature]<br>[Your Formal Title]</p>
    `
    },
    {
        id: 'blank',
        name: 'Blank Document',
        description: 'A clean slate with standard legal margins and formatting.',
        content: `<h1>[Title]</h1><p>Start drafting here...</p>`
    }
];

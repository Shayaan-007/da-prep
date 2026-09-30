export const metadata = { title: "Privacy | DA Prep" };

export default function Privacy() {
  return (
    <div className="max-w-2xl space-y-4 text-sm">
      <h1 className="page-title">Privacy notice</h1>
      <p>
        This is a draft notice for a project in development. Have it reviewed and completed by the site operator before
        launching publicly.
      </p>
      <h2 className="font-semibold">What we store</h2>
      <p>
        By default, your tracker, stories, practice scores and interview history are stored only in your browser. If you
        create an account, they are also stored against your email address so they sync between devices.
      </p>
      <h2 className="font-semibold">What is sent to AI services</h2>
      <p>
        Job adverts, CV or statement text and your interview answers are sent to Anthropic&apos;s Claude API to generate
        questions and feedback. Please don&apos;t include names, addresses, phone numbers or other personal details.
      </p>
      <h2 className="font-semibold">Speech and camera</h2>
      <p>
        Dictation uses your browser&apos;s speech recognition, which may send audio to your browser provider. The
        camera self-view stays on your device and is never recorded or uploaded.
      </p>
      <h2 className="font-semibold">Deleting your data</h2>
      <p>
        Signed-in users can delete their account and all cloud data from the Account page. Clearing your browser&apos;s
        site data removes local copies.
      </p>
      <h2 className="font-semibold">Age</h2>
      <p>This service is aimed at people aged 16 and over. If you are under 16, ask a parent or carer first.</p>
    </div>
  );
}

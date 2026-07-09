export function HomePage() {
  return (
    <div className="text-center">
      <h1 className="display-4">Welcome</h1>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <>
      <h1></h1>
      <p>Use this page to detail your site's privacy policy.</p>
    </>
  );
}

export function ErrorPage() {
  return (
    <>
      <h1 className="text-danger">Error.</h1>
      <h2 className="text-danger">An error occurred while processing your request.</h2>
      <h3>Development Mode</h3>
      <p>
        Swapping to the <strong>Development</strong> environment displays detailed information about the error that occurred.
      </p>
      <p>
        <strong>The Development environment shouldn&apos;t be enabled for deployed applications.</strong>
        It can result in displaying sensitive information from exceptions to end users.
        For local debugging, enable the <strong>Development</strong> environment by setting the <strong>ASPNETCORE_ENVIRONMENT</strong> environment variable to <strong>Development</strong>
        and restarting the app.
      </p>
    </>
  );
}

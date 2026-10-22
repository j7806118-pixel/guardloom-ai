import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

export default function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="placeholder-copy" padded>
        <h2>This screen comes in a later milestone.</h2>
        <p>
          The navigation is ready. This page still uses fictional demonstration framing for Aster
          Works, and it does not run analysis, save data, or call an API.
        </p>
      </Card>
    </>
  );
}

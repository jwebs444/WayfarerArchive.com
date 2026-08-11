const campaignUrl = process.env.NEXT_PUBLIC_BACKERKIT_CAMPAIGN_URL;
const preorderUrl = process.env.NEXT_PUBLIC_BACKERKIT_PREORDER_URL;

export default function FoundingBatchAction() {
  if (preorderUrl) {
    return (
      <>
        <a className="button button-sand" href={preorderUrl} data-bk-preorders={preorderUrl}>
          Join the founding batch
        </a>
        <script async src="https://www.backerkit.com/assets/preorders.js" />
      </>
    );
  }

  if (campaignUrl) {
    return (
      <a className="button button-sand" href={campaignUrl} target="_blank" rel="noreferrer">
        Follow the founding campaign
      </a>
    );
  }

  return (
    <span className="button button-disabled" aria-disabled="true">
      Founding list opens after the pilot
    </span>
  );
}

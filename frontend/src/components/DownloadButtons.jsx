import { downloadExcelUrl, downloadPdfUrl } from "../api";

export default function DownloadButtons({ visible }) {
  if (!visible) return null;

  return (
    <div className="button-row">
      <a className="btn-download" href={downloadExcelUrl()} style={buttonLinkStyle}>
        Download Excel
      </a>
      <a className="btn-download" href={downloadPdfUrl()} style={buttonLinkStyle}>
        Download PDF
      </a>
    </div>
  );
}

const buttonLinkStyle = {
  padding: "10px 18px",
  borderRadius: "6px",
  textDecoration: "none",
  color: "white",
  display: "inline-block",
};

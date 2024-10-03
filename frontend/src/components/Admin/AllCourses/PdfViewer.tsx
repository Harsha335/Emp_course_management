import React from 'react';
import { pdfjs } from 'react-pdf';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type PDFViewerType = {
  pdfUrl: string;
  closePDFViewer: () => void;
}
const PDFViewer: React.FC<PDFViewerType> = ({pdfUrl, closePDFViewer}) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white min-w-[80%] h-full rounded-lg shadow-lg max-w-md relative">
        <button
            onClick={closePDFViewer}
            className="absolute top-2 right-2 text-white hover:scale-150 cursor-pointer"
          >
          <CancelOutlinedIcon />
        </button>
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default PDFViewer;

// import React, { useState } from 'react';
// import axios from 'axios';
// // import { Document, Page } from 'react-pdf';
// import { pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// // pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;

// const PDFViewer: React.FC = () => {
//   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   // const [numPages, setNumPages] = useState<number>();
//   // const [pageNumber, setPageNumber] = useState<number>(1);

//   const fetchPdf = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await axios.get('http://localhost:5000/api/get-pdf', {
//         responseType: 'blob', // Fetch as a Blob
//       });

//       // Log the response to verify the Blob content
//       console.log("Blob response: ", response.data);

//       // Create a Blob URL for the PDF
//       const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
//       let pdfUrl = URL.createObjectURL(pdfBlob);
//       // Clean up the URL by removing spaces
//       pdfUrl = pdfUrl.replace(/\s+/g, '').trim();
//       console.log("Generated Blob URL: ", pdfUrl);

//       // Set the URL for rendering in react-pdf
//       setPdfUrl(pdfUrl);

//     } catch (err) {
//       setError('Error fetching the PDF.');
//       console.error('Error fetching the PDF:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
//   //   setNumPages(numPages);
//   // }

//   return (
//     <div>
//       <button onClick={fetchPdf}>Fetch PDF</button>

//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       {pdfUrl && (
//         <div>
//           <h3>PDF Preview</h3>
//           <div className='w-full h-screen'>
//             <iframe
//               src={pdfUrl}
//               width="100%"
//               height="100%"
//               style={{ border: 'none' }}
//               title="PDF Viewer"
//             />
//           </div>
//           {/* Display the PDF in the Document component */}
//           {/* <Document
//             file={pdfUrl}
//             onLoadSuccess={onDocumentLoadSuccess}
//           >
//             {Array.from(new Array(numPages), (_, index) => (
//               <Page key={`page_${index + 1}`} pageNumber={index + 1} />
//             ))}
//           </Document>
//           <p>
//             Page {pageNumber} of {numPages}
//           </p> */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PDFViewer;

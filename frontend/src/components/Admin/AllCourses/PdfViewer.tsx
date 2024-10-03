
// import { useState } from 'react';
// import { Document, Page } from 'react-pdf';
// import { pdfjs } from 'react-pdf';
// import 'react-pdf/dist/Page/TextLayer.css';
// import 'react-pdf/dist/Page/AnnotationLayer.css';
// import file from './mern.pdf'

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// function PdfViewer() {
//   const [numPages, setNumPages] = useState<number>();
//   const [pageNumber, setPageNumber] = useState<number>(1);

//   function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
//     setNumPages(numPages);
//   }

//   return (
//     <div>
//       <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
//         <Page pageNumber={pageNumber} />
//       </Document>
//       <p>
//         Page {pageNumber} of {numPages}
//       </p>
//     </div>
//   );
// }

// export default PdfViewer


// import React, { useEffect, useState } from 'react';
// import { Document, Page } from 'react-pdf';

// import samplePDF from './mern.pdf'
// import axios from 'axios';

// export default function PdfViewer() {
//   const [numPages, setNumPages] = useState(0);
//   const [pageNumber, setPageNumber] = useState(1);

//   function onDocumentLoadSuccess({ numPages } : {numPages: number}) {
//     setNumPages(numPages);
//     setPageNumber(1);
//   }

//   function changePage(offset: number) {
//     setPageNumber(prevPageNumber => prevPageNumber + offset);
//   }

//   function previousPage() {
//     changePage(-1);
//   }

//   function nextPage() {
//     changePage(1);
//   }

//   const [pdfData, setPdfData] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
// // https://www.dropbox.com/scl/fi/floswgk9bpf8xf4nn3kqg/mern.pdf?rlkey=3y2pvyd4tq4p9kbxhp5keqvsr&st=umo4bajl&dl=0

//   useEffect(() => {
//     const fetchPdf = async () => {
//         try {
//         //   const response = await axios.get('https://drive.google.com/file/d/0B5_bYKSaSy3kNmFmSlFJYXhhUXc/view?resourcekey=0-uK29Dy3ez9Kz23D76o3XnA', {
//         //     responseType: 'blob', // Important to set the response type as 'blob' for binary files
//         //   });
//         //   console.log("response: ",response)
//         //   // Create a URL for the PDF file
//         //   const pdfUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
//         //   setPdfData(pdfUrl);
//         const response = await axios.get('https://www.dropbox.com/scl/fi/floswgk9bpf8xf4nn3kqg/mern.pdf?rlkey=3y2pvyd4tq4p9kbxhp5keqvsr&st=umo4bajl&dl=0', {
//             responseType: 'blob', // Important to handle the response as a blob
//           });
    
//           // Create a URL for the PDF blob
//           const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));
    
//           // Set the PDF URL in state to display it
//           setPdfData(pdfUrl);
//         } catch (err) {
//           console.error('Error fetching the PDF:', err);
//           setError('Failed to load PDF.');
//         }
//       };
//     fetchPdf();
//   },[]);


//   return (
//     <>
//       <Document
//         file={pdfData}
//         onLoadSuccess={onDocumentLoadSuccess}
//       >
//         <Page pageNumber={pageNumber} />
//       </Document>
//       <div>
//         <p>
//           Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
//         </p>
//         <button
//           type="button"
//           disabled={pageNumber <= 1}
//           onClick={previousPage}
//         >
//           Previous
//         </button>
//         <button
//           type="button"
//           disabled={pageNumber >= numPages}
//           onClick={nextPage}
//         >
//           Next
//         </button>
//       </div>
//     </>
//   );
// }

import React, { useState } from 'react';
import axios from 'axios';
import fs from 'fs';
import { Document, Page } from 'react-pdf';

const PdfFetcher: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);

  const fetchPdf = async () => {
    setLoading(true);
    setError(null);

    try {

      const response = await axios.get('http://localhost:5000/api/get-pdf', {
        responseType: 'blob',
      });
    //   const pdfBuffer = Buffer.from(response.data);

    // const pdfPath = './output.pdf';
    // fs.writeFile(pdfPath, pdfBuffer, (err : any) => {
    //   if (err) {
    //     console.error('Error writing PDF to file:', err);
    //   } else {
    //     console.log('PDF file successfully created at:', pdfPath);
    //   }
    // });
    if (!response.ok) {
        throw new Error('Failed to fetch PDF');
    }

    const blob = await response.blob(); // Convert response to a Blob
    console.log(blob)
    const url = URL.createObjectURL(blob); // Create a URL for the Blob
    console.log(url)
    setPdfUrl(url); // Set the PDF URL for rendering
    } catch (err) {
      setError('Error fetching the PDF.');
      console.error('Error fetching the PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <button onClick={fetchPdf}>Fetch PDF</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {pdfUrl && (
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfFetcher;

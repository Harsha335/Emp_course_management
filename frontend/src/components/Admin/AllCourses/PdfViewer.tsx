// // SHOWES PDF AND ONLY TIME SPEND ON THE PDF , THIS DOES NOT INCLUDE THE PERCENTAGE COMPLETED

// import React, { useEffect, useRef } from 'react';
// import { pdfjs } from 'react-pdf';
// import axiosTokenInstance from '../../../api_calls/api_token_instance';
// // import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// type PDFViewerType = {
//   pdfUrl: string;
//   closePDFViewer: () => void;
// }

// const PDFViewer: React.FC<PDFViewerType> = ({ pdfUrl, closePDFViewer }) => {
//   const startTimeRef = useRef<number | null>(null);              // Time when popup opens

//   // Function to handle closing the PDF
//   const handlePDFClose = async () => {
//     try {
//       const endTime = Date.now();  // Time when closing
//       const timeSpent = (endTime - (startTimeRef.current || 0)) / 1000; // Time spent in seconds

//       console.log('Time spent on PDF:', timeSpent, 'seconds');

//       // send data to the backend
//       // await axiosTokenInstance.post('/api/courses/track', {
//       //   timeSpent,
//       //   scrollPercentage
//       // });

//     } catch (err) {
//       console.log('Error at handlePDFClose: ', err);
//     }
//     closePDFViewer();  // Close the PDF popup
//   };

//   return (
// <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//   <div className="bg-white min-w-[80%] h-full rounded-lg shadow-lg max-w-md relative">
//     <button
//       onClick={handlePDFClose}
//       className="absolute top-2 right-[-5rem] text-white bg-red-500 px-3 py-2 rounded-lg shadow-md shadow-black hover:scale-110 cursor-pointer"
//     >
//       {/* <CancelOutlinedIcon /> */}
//       Close
//     </button>
//         <iframe
//           src={pdfUrl}
//           width="100%"
//           height="100%"
//           title="PDF Viewer"
//         />
//       </div>
//     </div>
//   );
// };

// export default PDFViewer;


import React from "react";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

type PDFViewerType = {
  pdfUrl: string;
  closePDFViewer: () => void;
};

const PDFViewer: React.FC<PDFViewerType> = ({ pdfUrl, closePDFViewer }) => {

  // Initialize the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white min-w-[80%] h-[95%] relative">
        <button
          onClick={closePDFViewer}
          className="absolute top-2 right-[-5rem] text-white bg-red-500 px-3 py-2 rounded-lg shadow-md shadow-black hover:scale-110 cursor-pointer"
        >
          Close
        </button>

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]} // Use the plugin directly
              // onPageChange={handlePageChange} // Capture page change
              initialPage={10-1}  // starts at initialPage+1
              // defaultScale={SpecialZoomLevel.PageWidth} // Ensure the page fits the width of the viewer
            />
        </Worker>
      </div>
    </div>
  );
};

export default PDFViewer;

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



// import React, { ReactElement, useEffect, useRef, useState } from "react";
// import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// import { toolbarPlugin, ToolbarSlot } from "@react-pdf-viewer/toolbar";

// import "@react-pdf-viewer/core/lib/styles/index.css";
// import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// type PDFViewerType = {
//   pdfUrl: string;
//   closePDFViewer: () => void;
// };

// const PDFViewer: React.FC<PDFViewerType> = ({ pdfUrl, closePDFViewer }) => {
//   const [timeSpent, setTimeSpent] = useState(0); // Track time spent
//   const [currentPage, setCurrentPage] = useState(0); // Track current page number
//   const [totalPages, setTotalPages] = useState(0); // Track total pages

//   // Track time spent viewing the PDF
//   useEffect(() => {
//     const startTime = Date.now();

//     // Timer to calculate time spent
//     const intervalId = setInterval(() => {
//       setTimeSpent(Math.floor((Date.now() - startTime) / 1000)); // Time in seconds
//     }, 1000);

//     return () => {
//       clearInterval(intervalId); // Stop timer on unmount
//     };
//   }, []);

//   // Track page change
//   const handlePageChange = (e: { currentPage: number; doc: any }) => {
//     setCurrentPage(e.currentPage + 1); // Page numbers are 0-indexed, so we add 1
//     setTotalPages(e.doc.numPages); // Get the total number of pages
//   };

//   const renderToolbar = (Toolbar: (props: any) => ReactElement) => (
//     <Toolbar>
//       {(slots: ToolbarSlot) => {
//         const { ZoomOut } = slots;
//         return (
//           <div
//             style={{
//               alignItems: "center",
//               display: "flex",
//             }}
//           >
//             <div style={{ padding: "0px 2px" }}>
//               <ZoomOut>
//                 {(props: any) => (
//                   <button
//                     style={{
//                       backgroundColor: "#357edd",
//                       border: "none",
//                       borderRadius: "4px",
//                       color: "#ffffff",
//                       cursor: "pointer",
//                       padding: "8px",
//                     }}
//                     onClick={props.onClick}
//                   >
//                     Zoom out
//                   </button>
//                 )}
//               </ZoomOut>
//             </div>
//             {/* Add other toolbar slots as needed */}
//           </div>
//         );
//       }}
//     </Toolbar>
//   );

//   const defaultLayoutPluginInstance = defaultLayoutPlugin();

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white min-w-[80%] h-full rounded-lg shadow-lg max-w-md relative">
//         <button
//           onClick={closePDFViewer}
//           className="absolute top-2 right-[-5rem] text-white bg-red-500 px-3 py-2 rounded-lg shadow-md shadow-black hover:scale-110 cursor-pointer"
//         >
//           Close
//         </button>

//         {/* Display time spent, current page, and total pages */}
//         <div className="p-4 text-sm text-gray-700">
//           Time spent on PDF: {timeSpent} seconds <br />
//           Page: {currentPage} / {totalPages}
//         </div>

//         <Worker workerUrl="/pdf.worker.mjs">
//           {/* <div style={{ height: "720px", overflowY: "auto" }}> */}
//             <Viewer
//               fileUrl={pdfUrl}
//               plugins={[defaultLayoutPluginInstance]}
//               onPageChange={handlePageChange} // Capture page change
//               defaultScale={SpecialZoomLevel.PageWidth} // Ensure the page fits the width of the viewer
//             />
//           {/* </div> */}
//         </Worker>
//       </div>
//     </div>
//   );
// };

// export default PDFViewer;


import React, { useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PdfPropsDataType } from ".";
import axiosTokenInstance from "../../../api_calls/api_token_instance";

type PDFViewerType = {
  data: PdfPropsDataType ;
  closePDFViewer: () => void;
};

const PDFViewer: React.FC<PDFViewerType> = ({ data, closePDFViewer }) => {
  const [total_pages, setTotalPages] = useState<number | null>(null); // Track total pages
  const [current_page, setCurrentPage] = useState<number>(data.current_page || 1); // Track current page

  // Initialize the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Handle when the document is loaded
  const handleDocumentLoad = (e: any) => {
    const numPages = e.doc.numPages; // Get the total number of pages
    setTotalPages(numPages);
    console.log("Document loaded with total pages:", numPages);
  };

  // Track page change
  // const handlePageChange = (e: { currentPage: number; doc: any }) => {
  //   setCurrentPage(e.currentPage + 1); // Page numbers are 0-indexed, so we add 1
  //   setTotalPages(e.doc.numPages); // Get the total number of pages
  // };

  const handlePDFClose = async () => {
    try{
      const time_spent_in_sec = Math.floor((Date.now() - data.start_time) / 1000);
      console.log({current_page, total_pages, time_spent_in_sec});
      const response = axiosTokenInstance.post('/api/courses/updateAssignedCourse', {
        enroll_id: data.enroll_id,
        start_time: data.start_time,
        time_spent_in_sec,
        current_page,
        total_pages
      });
      
      console.log(response);
    }catch(err){
      console.log("ERROR at handlePDFClose: ", err);
    }
    closePDFViewer();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white min-w-[80%] h-[95%] relative">
        <button
          onClick={handlePDFClose}
          className="absolute top-2 right-[-5rem] text-white bg-red-500 px-3 py-2 rounded-lg shadow-md shadow-black hover:scale-110 cursor-pointer"
        >
          Close
        </button>

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={data.pdfUrl}
              plugins={[defaultLayoutPluginInstance]} // Use the plugin directly
              onDocumentLoad={handleDocumentLoad} // Capture total pages on load
              onPageChange={(e) => setCurrentPage(e.currentPage + 1)} // Capture page change
              initialPage={data.current_page ? data.current_page - 1 : 0} // starts at initialPage+1
              defaultScale={SpecialZoomLevel.PageWidth} // Ensure the page fits the width of the viewer
            />
        </Worker>
      </div>
    </div>
  );
};

export default PDFViewer;

"use client"
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptProps {
    payment: any;
    }

const Receipt = ({payment}: ReceiptProps) => {

    const handlePrint = () => {
    try{const input = document.getElementById('receiptDiv');
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
         pdf.addImage({
      imageData: imgData,
      format: 'PNG',
      x: 15,
      y: 10,
      width: 150,
      height: 200,
      alias: '',
      compression: 'NONE',
      rotation: 0
    });
      pdf.save('receipt.pdf');
    });}

    catch(error){
      console.log(error)
    }

    
  };

    return ( <div>
      <div className="flex justify-center items-center flex-col bg-white  rounded-lg" >
          
      <div id="receiptDiv"  >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Patient Invoice</h2>
            <span className="text-gray-500">Invoice #12345</span>
          </div>
          {/* Patient Information */}
          <div className="border-b border-gray-300 pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name:</p>
                <p className="font-medium">{payment.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patient ID:</p>
                <p className="font-medium">{payment.id}</p>
              </div>
              {/* Add more patient details as needed */}
            </div>
          </div>
          {/* Invoice Details */}
          <div className="border-b border-gray-300 pb-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date:</p>
                <p className="font-medium">December 8, 2023</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount paid:</p>
                <p className="font-medium">{payment.bill}</p>
              </div>
              {/* Add more invoice details as needed */}
            </div>
          </div>
          {/* Invoice Items */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="">
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-left">Surgery</th>
                    <th className="py-2 px-4 text-left">Cost</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {/* Sample Invoice Items */}
                  <tr>
                    <td className="py-2 px-4">{payment.dx}</td>
                    <td className="py-2 px-4">{payment.surgery}</td>
                    <td className="py-2 px-4">₹{payment.bill}</td>
                    
                  </tr>
                  {/* Add more invoice items as needed */}
                </tbody>
              </table>
            </div>
          </div>
          {/* Total Amount */}
          <div className="mt-2 mb-6">
            <p className="text-xl font-semibold">Total Amount paid: ₹{payment.bill}</p>
          </div>
              </div>
      </div>          
          <Button className="mt-4" onClick={handlePrint}>
          Print
        </Button>
     
    </div> );
}
 
export default Receipt;
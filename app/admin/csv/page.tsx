'use client'
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';

interface CsvFileReaderProps {}

const CsvFileReader: React.FC<CsvFileReaderProps> = () => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [jsonData, setjsonData] = useState<string[][]>([]);

  const router = useRouter();

  const handleCsvData = (data: any) => {
    setCsvData(data);

    const headers = data[0];
    const json = data.slice(1).map((row: string[]) => {
      const obj: { [key: string]: any } = {};
      headers.forEach((header: any, index: any) => {
         switch (header.toLowerCase()) {

            case 'age' || 'ipdReg'  || 'bill':
                obj[header] = parseInt(row[index], 10);
            
            case 'doad' || 'dood':

                const parts = row[index].split('/');

                console.log(parts)
                if (parts.length !== 3) {
                    throw new Error('Invalid date format');
                }

    
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; 
                let year = parseInt(parts[2], 10);
        
                if (year < 100) {
                    year += 2000;
                }

                obj[header] = new Date(year, month, day);

                default:
                    obj[header] = row[index];
        }        
            
        });
            return obj;
    });

    setjsonData(json);
  };

  const handleSubmit = async() => {
    console.log(jsonData)
    try{
       await  axios.post('/api/csv', jsonData)
       router.push('/admin/patients');
       router.refresh();
    }
    catch(error){
        console.log(error)
    }
   
  }
  

  return (
    <div className="flex flex-col items-center mt-8">
      <div className='flex flex-col'>
          <h2 className="text-xl font-bold mb-4">Drag and Drop CSV File</h2>
          <CSVReader
            onFileLoaded={handleCsvData}
            inputStyle={{ borderRadius: 10, padding: 20 }}
          />
          <Button variant="primary" onClick={handleSubmit}>
            Add to database
          </Button>
      </div>
      {csvData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">CSV Data</h3>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="">
                {csvData[0].map((header: string, index: number) => (
                  <th key={index}  className="border border-gray-400 py-2 px-4 bg-transparent">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row: string[], index: number) => (
                <tr key={index} className="border border-gray-400">
                  {row.map((cell: string, cellIndex: number) => (
                    <td key={cellIndex} className="border border-gray-400 py-2 px-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CsvFileReader;

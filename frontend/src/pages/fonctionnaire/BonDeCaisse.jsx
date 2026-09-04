import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const BonDeCaisse = () => {
  const componentRef = useRef();
  
  const [formData, setFormData] = useState({
    anarana: '',
    fanampiny: '',
    cn: '',
    num: '',
    adiresy: '',
    tel: '',
    localite: '',
    daty: '',
    fangatahana: '',
    vola: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Bon_de_Caisse',
  });

  const InputField = ({ label, name, type = 'text', className = '' }) => (
    <div className="flex items-center mb-2">
      <span className="w-32">{label} :</span>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`flex-1 border-b border-black border-dotted bg-transparent focus:outline-none focus:border-blue-500 print:border-black print:placeholder-transparent ${className}`}
        placeholder={`Entrer ${label.toLowerCase()}`}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex flex-col items-center font-sans text-gray-800">
      
      {/* Controls */}
      <div className="mb-6 w-full max-w-[800px] flex justify-end print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Imprimer / PDF
        </button>
      </div>

      {/* Paper Container */}
      <div 
        ref={componentRef}
        className="bg-white w-full max-w-[800px] shadow-lg p-6 sm:p-12 relative border border-gray-200 print:shadow-none print:border-none print:p-12 print:max-w-none print:w-[800px]" 
        style={{ minHeight: '1050px' }}
      >
        
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row justify-between mb-8 gap-8 sm:gap-0">
          {/* Top Left - Info Fields */}
          <div className="w-full sm:w-1/2 text-sm">
            <InputField label="Anarana" name="anarana" />
            <InputField label="Fanampiny" name="fanampiny" />
            <InputField label="C/N" name="cn" />
            <InputField label="N°" name="num" />
            <InputField label="Adiresy" name="adiresy" />
            <InputField label="Tél" name="tel" />
            <InputField label="Localité de service" name="localite" />
          </div>

          {/* Top Right - Destination */}
          <div className="w-full sm:w-1/2 sm:pl-8 flex flex-col">
            <div className="flex items-center mb-6 text-sm">
              <span className="w-12">Daty :</span>
              <input
                type="date"
                name="daty"
                value={formData.daty}
                onChange={handleChange}
                className="flex-1 border-b border-black border-dotted bg-transparent focus:outline-none focus:border-blue-500 print:border-black"
              />
            </div>
            
            <div className="text-center mt-2 leading-tight">
              <p className="font-semibold">Ho an'ny</p>
              <p className="font-bold mt-2">ANDRIAMATOA LEHIBEN'NY</p>
              <p className="font-bold">SAMPANDRAHARAHA MISAHANA NY</p>
              <p className="font-bold">KARAMAN'NY MPIASAM-PANJAKANA SY NY</p>
              <p className="font-bold">FISOTROAN-DRONONO</p>
              <p className="font-bold">AMORON'I MANIA</p>
            </div>
          </div>
        </div>

        {/* Object */}
        <div className="flex items-center mb-8 mt-12">
          <span className="font-semibold mr-2">Antony: Fangatahana</span>
          <input
            type="text"
            name="fangatahana"
            value={formData.fangatahana}
            onChange={handleChange}
            className="flex-1 border-b border-black border-dotted bg-transparent focus:outline-none text-lg print:border-black"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6 mt-8">
          <p>Andriamatoa Lehiben'ny sampandraharaha,</p>
          
          <div className="leading-relaxed flex flex-col sm:flex-row sm:items-center flex-wrap">
            <span>Voninahitra ho ahy ny voalaza anarana eto ambony ny mangataka ny fahazoan-dalana mba handoa ahy ny </span>
            <input
              type="text"
              name="vola"
              value={formData.vola}
              onChange={handleChange}
              className="w-full sm:w-[350px] border-b border-black border-dotted sm:ml-2 mt-2 sm:mt-0 bg-transparent focus:outline-none font-bold text-center print:border-black"
              placeholder="montant (vola)"
            />
          </div>

          <div className="leading-relaxed mt-6">
            <p className="mb-4">Indro ampiarahiko amin'ity fangatahana ity ny atontan-taratasy rehetra mikasika izany:</p>
            <div className="space-y-4 w-full">
              <div className="w-full border-b border-black border-dotted h-6"></div>
              <div className="w-full border-b border-black border-dotted h-6"></div>
              <div className="w-full border-b border-black border-dotted h-6"></div>
              <div className="w-full border-b border-black border-dotted h-6"></div>
            </div>
          </div>
        </div>

        {/* Politeness & Signature */}
        <div className="mt-12 flex flex-col space-y-12">
          <p>Raiso , Andriamatoa Lehiben'ny sampandraharaha, ny haja ambony atolotro anao.</p>
          
          <div className="self-end text-center mr-0 sm:mr-12">
            <p className="mb-12">Sonia</p>
            <p>Anarana sy fanampiny</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="absolute bottom-8 sm:bottom-16 left-0 w-full text-center">
          <p className="font-bold text-sm sm:text-lg uppercase tracking-wide px-4 sm:px-12 leading-relaxed text-gray-700">
            ANY AMIN'NY CISCO IZAY NIASANAREO NO<br/>
            AKANA ILAY BON DE CAISSE TOMPOKO !
          </p>
        </div>
      </div>
    </div>
  );
};

export default BonDeCaisse;

import React, { useState, useMemo, useRef } from 'react';
import { SchoolDatabase, Student, UserRole, AttachedDocument } from '../types';
import { dbService } from '../services/db';
import { getSubsystemForGrade } from '../utils/educationSubsystems';

interface AlunosViewProps {
  db: SchoolDatabase;
  currentUserRole: UserRole;
  onOpenReportCard: (student: Student) => void;
}

const DEFAULT_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const AlunosView: React.FC<AlunosViewProps> = ({ db, currentUserRole, onOpenReportCard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedFinanceStatus, setSelectedFinanceStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [tableTab, setTableTab] = useState<'geral' | 'biografico' | 'historico_docs'>('geral');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Refs de carregamento de ficheiros
  const fileInputRef = useRef<HTMLInputElement>(null);
  const biFileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const otherDocsInputRef = useRef<HTMLInputElement>(null);

  // Form State com todos os campos solicitados e documentos reais
  const [formData, setFormData] = useState({
    name: '',
    procNumber: '',
    gender: 'Masculino' as 'Masculino' | 'Feminino' | string,
    biNumber: '',
    nationality: 'Angolana',
    birthPlace: 'Luanda',
    birthDate: '2008-05-10',
    address: 'Bairro Morro Bento, Luanda',
    studentPhone: '+244 923 000 000',
    email: '',
    classId: db.classes[0]?.id.toString() || '1',
    // Encarregado
    guardianName: '',
    guardianRelation: 'Pai',
    guardianPhone: '+244 912 345 678',
    guardianEmail: '',
    // Financeiro
    monthlyTuitionKz: 95000,
    financialStatus: 'regular' as 'regular' | 'debito' | 'isento',
    // 4. HISTÓRICO ESCOLAR
    previousSchool: 'Colégio São Francisco de Assis',
    lastCompletedGrade: '9.ª Classe',
    academicSituation: 'Transitado' as 'Transitado' | 'Reprovado' | 'Primeira Matrícula' | 'Transferido' | string,
    // 5. DOCUMENTOS
    docBiCopy: 'Entregue' as 'Entregue' | 'Pendente' | 'Dispensado' | string,
    docCertificate: 'Entregue' as 'Entregue' | 'Declaração Provisória' | 'Pendente' | string,
    docPassPhoto: DEFAULT_SAMPLE_PHOTOS[0],
    docBiFile: null as AttachedDocument | null,
    docCertificateFile: null as AttachedDocument | null,
    additionalDocs: [] as AttachedDocument[]
  });

  const studentList = db.students || [];
  const filteredStudents = useMemo(() => {
    return studentList.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.procNumber && s.procNumber.toLowerCase().includes(q)) ||
        (s.biNumber && s.biNumber.toLowerCase().includes(q)) ||
        (s.citizenCard && s.citizenCard.toLowerCase().includes(q)) ||
        (s.studentPhone && s.studentPhone.toLowerCase().includes(q)) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q)) ||
        (s.guardianPhone && s.guardianPhone.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.birthPlace && s.birthPlace.toLowerCase().includes(q)) ||
        (s.previousSchool && s.previousSchool.toLowerCase().includes(q));

      const matchesClass = selectedClassId === 'all' || String(s.classId) === selectedClassId;
      const matchesFinance = selectedFinanceStatus === 'all' || s.financialStatus === selectedFinanceStatus;
      const matchesGender =
        selectedGender === 'all' ||
        (selectedGender === 'M' && (s.gender === 'Masculino' || s.gender === 'M')) ||
        (selectedGender === 'F' && (s.gender === 'Feminino' || s.gender === 'F'));

      return matchesSearch && matchesClass && matchesFinance && matchesGender;
    });
  }, [studentList, searchTerm, selectedClassId, selectedFinanceStatus, selectedGender]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setSubmitStatus('idle');
    const initialClass = db.classes[0];
    let initialTuition = 95000;
    if (initialClass) {
      const sub = getSubsystemForGrade(initialClass.grade);
      if (sub?.id === 'pre_escolar') initialTuition = 45000;
      else if (sub?.id === 'primario') initialTuition = 65000;
      else if (sub?.id === 'secundario_1') initialTuition = 75000;
      else if (sub?.id === 'secundario_2') initialTuition = 95000;
      else if (sub?.id === 'superior') initialTuition = 140000;
    }

    const randomPhoto = DEFAULT_SAMPLE_PHOTOS[Math.floor(Math.random() * DEFAULT_SAMPLE_PHOTOS.length)];

    setFormData({
      name: '',
      procNumber: `PROC-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: 'Masculino',
      biNumber: `00${Math.floor(4800000 + Math.random() * 900000)}LA042`,
      nationality: 'Angolana',
      birthPlace: 'Luanda',
      birthDate: '2008-05-10',
      address: 'Bairro Morro Bento, Rua Direita, Luanda',
      studentPhone: '+244 923 000 000',
      email: '',
      classId: initialClass?.id.toString() || '1',
      guardianName: '',
      guardianRelation: 'Pai',
      guardianPhone: '+244 912 345 678',
      guardianEmail: '',
      monthlyTuitionKz: initialTuition,
      financialStatus: 'regular',
      previousSchool: 'Colégio São Francisco de Assis',
      lastCompletedGrade: '9.ª Classe',
      academicSituation: 'Transitado',
      docBiCopy: 'Entregue',
      docCertificate: 'Entregue',
      docPassPhoto: randomPhoto,
      docBiFile: null,
      docCertificateFile: null,
      additionalDocs: []
    });
    setIsModalOpen(true);
  };

  const handleClassChange = (selectedClassId: string) => {
    const targetClass = db.classes.find((c) => String(c.id) === String(selectedClassId));
    let suggestedTuition = formData.monthlyTuitionKz;
    if (!editingStudent && targetClass) {
      const sub = getSubsystemForGrade(targetClass.grade);
      if (sub?.id === 'pre_escolar') suggestedTuition = 45000;
      else if (sub?.id === 'primario') suggestedTuition = 65000;
      else if (sub?.id === 'secundario_1') suggestedTuition = 75000;
      else if (sub?.id === 'secundario_2') suggestedTuition = 95000;
      else if (sub?.id === 'superior') suggestedTuition = 140000;
    }
    setFormData((prev) => ({
      ...prev,
      classId: selectedClassId,
      monthlyTuitionKz: suggestedTuition
    }));
  };

  const selectedClassObj = useMemo(() => {
    return db.classes.find((c) => String(c.id) === String(formData.classId));
  }, [db.classes, formData.classId]);

  const selectedClassSubsystem = useMemo(() => {
    return selectedClassObj ? getSubsystemForGrade(selectedClassObj.grade) : null;
  }, [selectedClassObj]);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setSubmitStatus('idle');
    const photo = student.docPassPhoto || student.avatar || DEFAULT_SAMPLE_PHOTOS[0];
    setFormData({
      name: student.name || '',
      procNumber: student.procNumber || '',
      gender: student.gender || 'Masculino',
      biNumber: student.biNumber || student.citizenCard || '',
      nationality: student.nationality || 'Angolana',
      birthPlace: student.birthPlace || 'Luanda',
      birthDate: student.birthDate || '2008-05-10',
      address: student.address || 'Luanda, Angola',
      studentPhone: student.studentPhone || '+244 923 000 000',
      email: student.email || '',
      classId: String(student.classId || '1'),
      guardianName: student.guardianName || '',
      guardianRelation: student.guardianRelation || 'Pai',
      guardianPhone: student.guardianPhone || '+244 9',
      guardianEmail: student.guardianEmail || '',
      monthlyTuitionKz: student.monthlyTuitionKz || 95000,
      financialStatus: student.financialStatus || 'regular',
      previousSchool: student.previousSchool || 'Colégio São Francisco de Assis',
      lastCompletedGrade: student.lastCompletedGrade || '9.ª Classe',
      academicSituation: student.academicSituation || 'Transitado',
      docBiCopy: student.docBiCopy || 'Entregue',
      docCertificate: student.docCertificate || 'Entregue',
      docPassPhoto: photo,
      docBiFile: student.docBiFile || null,
      docCertificateFile: student.docCertificateFile || null,
      additionalDocs: student.additionalDocs || []
    });
    setIsModalOpen(true);
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            docPassPhoto: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('O ficheiro do B.I. / Passaporte excede o limite máximo permitido de 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const attached: AttachedDocument = {
          id: `bi-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          uploadDate: new Date().toLocaleDateString('pt-PT'),
          dataUrl: reader.result
        };
        setFormData((prev) => ({
          ...prev,
          docBiCopy: 'Entregue',
          docBiFile: attached
        }));
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleRemoveBiFile = () => {
    setFormData((prev) => ({
      ...prev,
      docBiFile: null
    }));
  };

  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('O ficheiro do Certificado excede o limite máximo permitido de 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const attached: AttachedDocument = {
          id: `cert-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          uploadDate: new Date().toLocaleDateString('pt-PT'),
          dataUrl: reader.result
        };
        setFormData((prev) => ({
          ...prev,
          docCertificate: 'Entregue',
          docCertificateFile: attached
        }));
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleRemoveCertFile = () => {
    setFormData((prev) => ({
      ...prev,
      docCertificateFile: null
    }));
  };

  const handleAdditionalDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = (formData.additionalDocs || []).length;
    if (currentCount + files.length > 3) {
      alert(`Pode anexar no máximo 3 documentos adicionais no total. Já possui ${currentCount} documento(s) anexado(s).`);
      return;
    }

    // Validate size and types
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`O ficheiro "${file.name}" excede o limite de 5MB.`);
        return;
      }
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        alert(`O ficheiro "${file.name}" não é suportado. Carregue ficheiros PDF ou Imagens (JPEG/PNG).`);
        return;
      }
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const doc: AttachedDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            uploadDate: new Date().toLocaleDateString('pt-PT'),
            dataUrl: reader.result
          };
          setFormData((prev) => ({
            ...prev,
            additionalDocs: [...(prev.additionalDocs || []), doc]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveAdditionalDoc = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalDocs: (prev.additionalDocs || []).filter((d) => d.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitStatus !== 'idle') return;
    setSubmitStatus('loading');
    const photo = formData.docPassPhoto || DEFAULT_SAMPLE_PHOTOS[0];

    setTimeout(() => {
      if (editingStudent) {
        dbService.updateStudent(editingStudent.id, {
          name: formData.name,
          procNumber: formData.procNumber,
          gender: formData.gender,
          biNumber: formData.biNumber,
          citizenCard: formData.biNumber,
          nationality: formData.nationality,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
          address: formData.address,
          studentPhone: formData.studentPhone,
          email: formData.email,
          classId: String(formData.classId),
          guardianName: formData.guardianName,
          guardianRelation: formData.guardianRelation,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          monthlyTuitionKz: Number(formData.monthlyTuitionKz),
          financialStatus: formData.financialStatus,
          previousSchool: formData.previousSchool,
          lastCompletedGrade: formData.lastCompletedGrade,
          academicSituation: formData.academicSituation,
          docBiCopy: formData.docBiCopy,
          docCertificate: formData.docCertificate,
          docPassPhoto: photo,
          avatar: photo,
          docBiFile: formData.docBiFile || undefined,
          docCertificateFile: formData.docCertificateFile || undefined,
          additionalDocs: formData.additionalDocs || []
        });
      } else {
        const selectedCls = db.classes.find((c) => String(c.id) === String(formData.classId));
        dbService.addStudent({
          name: formData.name,
          procNumber: formData.procNumber,
          gender: formData.gender,
          biNumber: formData.biNumber,
          citizenCard: formData.biNumber,
          nationality: formData.nationality,
          birthPlace: formData.birthPlace,
          birthDate: formData.birthDate,
          address: formData.address,
          studentPhone: formData.studentPhone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@bandmed.edu.pt`,
          nif: '5419' + Math.floor(100000 + Math.random() * 900000),
          classId: String(formData.classId),
          className: selectedCls?.name || '10º Ano - Turma A',
          section: selectedCls?.section || 'A',
          cycle: selectedCls?.cycle || 'Ensino Secundário',
          grade: selectedCls?.grade || '10º Ano',
          guardianName: formData.guardianName,
          guardianRelation: formData.guardianRelation,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          guardianNif: '2418' + Math.floor(10000 + Math.random() * 90000),
          monthlyTuitionKz: Number(formData.monthlyTuitionKz),
          financialStatus: formData.financialStatus,
          previousSchool: formData.previousSchool,
          lastCompletedGrade: formData.lastCompletedGrade,
          academicSituation: formData.academicSituation,
          docBiCopy: formData.docBiCopy,
          docCertificate: formData.docCertificate,
          docPassPhoto: photo,
          avatar: photo,
          docBiFile: formData.docBiFile || undefined,
          docCertificateFile: formData.docCertificateFile || undefined,
          additionalDocs: formData.additionalDocs || [],
          status: 'active',
          unexcusedAbsences: 0,
          excusedAbsences: 0,
          isTuitionPaidCurrentMonth: formData.financialStatus !== 'debito',
          disciplineGrades: [
            { subject: 'Língua Portuguesa', score: 15.0, maxScore: 20 },
            { subject: 'Matemática', score: 16.0, maxScore: 20 }
          ]
        });
      }
      setSubmitStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus('idle');
      }, 700);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12 rounded-none">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Módulo Académico • MED Angola
            </span>
            <span className="w-1.5 h-1.5 bg-[#0b1f3a]" />
            <span className="text-xs font-semibold text-[#0b1f3a]">Registo Biográfico & Matrículas</span>
          </div>
          <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            Gestão de Alunos & Matrículas
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Processos biográficos oficiais, histórico escolar prévio, documentação e situação de tesouraria.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUserRole === 'admin' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#0b1f3a] hover:bg-[#7a0c0c] active:scale-[0.99] transition-all text-white font-bold text-xs shadow-none shrink-0 cursor-pointer border border-[#0b1f3a]"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ MATRICULAR NOVO ALUNO</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="bg-white p-4 rounded-none border border-slate-300 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, processo, BI, telefone, encarregado, escola..."
              className="w-full h-9 pl-9 pr-3 rounded-none bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:bg-white focus:border-[#0b1f3a]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-9 px-3 rounded-none bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 focus:border-[#0b1f3a]"
            >
              <option value="all">Todas as Turmas</option>
              {db.classes.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name} ({c.shift})
                </option>
              ))}
            </select>

            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="h-9 px-3 rounded-none bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 focus:border-[#0b1f3a]"
            >
              <option value="all">Todos os Géneros</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>

            <select
              value={selectedFinanceStatus}
              onChange={(e) => setSelectedFinanceStatus(e.target.value)}
              className="h-9 px-3 rounded-none bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 focus:border-[#0b1f3a]"
            >
              <option value="all">Todos os Estados Financeiros</option>
              <option value="regular">Regular (Sem Mora)</option>
              <option value="debito">Em Débito (Mora)</option>
              <option value="isento">Isento / Bolseiro</option>
            </select>

            <span className="text-xs text-slate-500 font-mono pl-2">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno' : 'alunos'}
            </span>
          </div>
        </div>

        {/* View mode tabs for detailed columns */}
        <div className="flex items-center gap-2 border-t border-slate-200 pt-2.5">
          <span className="text-[11px] font-bold uppercase text-slate-500 mr-1">Colunas da Tabela:</span>
          <button
            onClick={() => setTableTab('geral')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              tableTab === 'geral'
                ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Visão Geral Académica
          </button>
          <button
            onClick={() => setTableTab('biografico')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              tableTab === 'biografico'
                ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            Dados Biográficos & Contactos
          </button>
          <button
            onClick={() => setTableTab('historico_docs')}
            className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              tableTab === 'historico_docs'
                ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            4. Histórico Escolar & 5. Documentos
          </button>
        </div>
      </div>

      {/* Main Table - Cantos Totalmente Quadrados */}
      <div className="bg-white rounded-none border border-slate-300 overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b1f3a] text-white font-bold uppercase text-[11px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 text-white border-r border-slate-800/40">Foto & Aluno</th>
                <th className="py-3 px-3 text-white border-r border-slate-800/40">Turma</th>
                
                {tableTab === 'geral' && (
                  <>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">BI / Passaporte & Género</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Encarregado & Parentesco</th>
                    <th className="py-3 px-3 text-center text-white border-r border-slate-800/40">Assiduidade</th>
                    <th className="py-3 px-3 text-center text-white border-r border-slate-800/40">Média</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Tesouraria</th>
                  </>
                )}

                {tableTab === 'biografico' && (
                  <>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Género & N.º BI / Passaporte</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Nacionalidade & Naturalidade</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Endereço / Bairro</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Tel. Aluno</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Encarregado (Parentesco)</th>
                  </>
                )}

                {tableTab === 'historico_docs' && (
                  <>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Escola de Proveniência</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Classe Concluída & Situação</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Cópia do BI/Passaporte</th>
                    <th className="py-3 px-3 text-white border-r border-slate-800/40">Certificado</th>
                    <th className="py-3 px-3 text-center text-white border-r border-slate-800/40">Foto Tipo Passe</th>
                  </>
                )}

                <th className="py-3 px-4 text-right text-white">Ações Oficiais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={tableTab === 'geral' ? 8 : 7} className="py-12 text-center text-slate-500 text-xs">
                    Nenhum registo de aluno encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentClass = db.classes.find((c) => String(c.id) === String(student.classId));
                  const studentPhoto = student.docPassPhoto || student.avatar || DEFAULT_SAMPLE_PHOTOS[0];
                  const genderLabel = student.gender === 'Feminino' || student.gender === 'F' ? 'Feminino' : 'Masculino';
                  const docBi = student.docBiCopy || 'Entregue';
                  const docCert = student.docCertificate || 'Entregue';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors border-b border-slate-200">
                      {/* Foto Tipo Passe e Aluno */}
                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          {/* Fotografia tipo passe quadrada */}
                          <div className="relative w-11 h-13 shrink-0 bg-slate-100 border border-slate-300 overflow-hidden shadow-none">
                            <img
                              src={studentPhoto}
                              alt={student.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#0b1f3a] text-sm leading-snug">{student.name}</div>
                            <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[11px] font-mono mt-0.5">
                              <span className="font-bold text-slate-700">Proc. #{student.procNumber}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600">
                                {student.biNumber || student.citizenCard || 'BI Pendente'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Turma */}
                      <td className="py-3 px-3 border-r border-slate-200">
                        <span className="font-bold text-slate-800 block">
                          {studentClass ? studentClass.name : student.className || 'Turma Atribuída'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{studentClass?.shift || 'Manhã'}</span>
                      </td>

                      {/* Conteúdo dinâmico de acordo com a aba */}
                      {tableTab === 'geral' && (
                        <>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-mono font-semibold text-slate-800">
                              {student.biNumber || student.citizenCard || 'Pendente'}
                            </div>
                            <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 border border-slate-300">
                              {genderLabel}
                            </span>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-semibold text-slate-800">{student.guardianName || 'Não registado'}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <span className="font-bold text-[#0b1f3a]">({student.guardianRelation || 'Encarregado'})</span>
                              <span className="font-mono">{student.guardianPhone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center border-r border-slate-200">
                            <div className="font-bold font-mono text-[#0b1f3a]">{student.attendanceRate || 100}%</div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {student.unexcusedAbsences || 0} faltas
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center border-r border-slate-200">
                            <span
                              className={`inline-block px-2 py-0.5 font-bold font-mono text-xs border ${
                                (student.currentAverage || 0) >= 14
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : (student.currentAverage || 0) >= 10
                                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                                  : 'bg-red-50 text-red-800 border-red-300'
                              }`}
                            >
                              {(student.currentAverage || 15.0).toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            {student.financialStatus === 'regular' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-300">
                                Regular
                              </span>
                            ) : student.financialStatus === 'debito' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[#7a0c0c] font-bold text-[11px] border border-red-300">
                                Em Débito
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-300">
                                Isento
                              </span>
                            )}
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                              {(student.monthlyTuitionKz || 95000).toLocaleString()} Kz/mês
                            </span>
                          </td>
                        </>
                      )}

                      {tableTab === 'biografico' && (
                        <>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <span className="inline-block text-[10px] uppercase font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 border border-slate-300 mr-1.5">
                              {genderLabel}
                            </span>
                            <div className="font-mono font-bold text-slate-800 mt-1">
                              {student.biNumber || student.citizenCard || 'Sem registo'}
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-semibold text-slate-800">{student.nationality || 'Angolana'}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Nat: {student.birthPlace || 'Luanda'}
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 max-w-xs">
                            <div className="text-slate-800 font-medium truncate" title={student.address}>
                              {student.address || 'Luanda, Angola'}
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-mono font-bold text-[#0b1f3a]">
                              {student.studentPhone || 'Não informado'}
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-bold text-slate-800">{student.guardianName || 'Não registado'}</div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Parentesco: <strong className="text-[#0b1f3a]">{student.guardianRelation || 'Encarregado'}</strong>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{student.guardianPhone}</div>
                          </td>
                        </>
                      )}

                      {tableTab === 'historico_docs' && (
                        <>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-bold text-slate-800">
                              {student.previousSchool || 'Colégio São Francisco de Assis'}
                            </div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <div className="font-semibold text-slate-800">
                              {student.lastCompletedGrade || '9.ª Classe'}
                            </div>
                            <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 border bg-blue-50 text-blue-800 border-blue-200 uppercase">
                              {student.academicSituation || 'Transitado'}
                            </span>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                docBi === 'Entregue'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {docBi}
                            </span>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                docCert === 'Entregue'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : docCert === 'Declaração Provisória'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {docCert}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center border-r border-slate-200">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              Passe OK
                            </span>
                          </td>
                        </>
                      )}

                      {/* Ações Oficiais */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-slate-700 hover:text-white hover:bg-[#0b1f3a] transition-colors cursor-pointer border border-transparent hover:border-[#0b1f3a]"
                            title="Consultar Ficha Individual Completa"
                          >
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                          </button>

                          <button
                            onClick={() => onOpenReportCard(student)}
                            className="p-1.5 text-slate-700 hover:text-white hover:bg-[#0b1f3a] transition-colors cursor-pointer border border-transparent hover:border-[#0b1f3a]"
                            title="Emitir Boletim Oficial de Notas"
                          >
                            <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </button>

                          {currentUserRole === 'admin' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(student)}
                                className="p-1.5 text-slate-700 hover:text-white hover:bg-blue-700 transition-colors cursor-pointer border border-transparent hover:border-blue-700"
                                title="Editar dados e documentos da matrícula"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => setStudentToDelete(student)}
                                className="p-1.5 text-slate-500 hover:text-white hover:bg-[#ac332b] transition-colors cursor-pointer border border-transparent hover:border-[#ac332b]"
                                title="Eliminar aluno da base de dados"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTO / EDIÇÃO DE ALUNO COM TODOS OS CAMPOS SOLICITADOS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-none max-w-3xl w-full shadow-2xl border border-slate-400 overflow-hidden flex flex-col max-h-[94vh]">
            {/* Header do Modal */}
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
                <h3 className="font-bold text-base tracking-wide uppercase">
                  {editingStudent ? 'Editar Ficha e Matrícula do Aluno' : 'Nova Matrícula Escolar Oficial'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Formulário com cantos retos e campos agrupados */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs bg-white">
              {/* 1. IDENTIFICAÇÃO PESSOAL */}
              <div className="border border-slate-300 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                  <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">badge</span>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    1. Identificação Pessoal & Dados Biográficos
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Nome Completo do Estudante *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Manuel António da Costa"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      N.º de Processo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.procNumber}
                      onChange={(e) => setFormData({ ...formData, procNumber: e.target.value })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Género *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      N.º do Bilhete de Identidade / Passaporte *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.biNumber}
                      onChange={(e) => setFormData({ ...formData, biNumber: e.target.value })}
                      placeholder="Ex: 004819201LA042"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono font-semibold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Nacionalidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="Ex: Angolana"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Naturalidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                      placeholder="Ex: Luanda, Benguela, Huambo..."
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Telefone de Contacto do Aluno *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentPhone}
                      onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                      placeholder="+244 923 000 000"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Endereço / Bairro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Bairro Morro Bento, Rua Direita, nº 14, Luanda"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      E-mail Institucional / Pessoal
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="aluno@bandmed.edu.pt"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. ENQUADRAMENTO ESCOLAR & PLANO FINANCEIRO */}
              <div className="border border-slate-300 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                  <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">school</span>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    2. Enquadramento de Turma & Plano Financeiro
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block uppercase font-bold text-slate-700">Turma de Ingresso *</label>
                      {selectedClassSubsystem && (
                        <span className="text-[10px] font-mono text-[#0b1f3a] bg-blue-50 px-1.5 py-0.2 border border-blue-200 font-bold truncate max-w-[120px]">
                          {selectedClassSubsystem.shortName}
                        </span>
                      )}
                    </div>
                    <select
                      value={formData.classId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none text-xs font-semibold"
                    >
                      {db.classes.map((c) => (
                        <option key={c.id} value={c.id.toString()}>
                          {c.name} ({c.grade} • {c.shift})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Propina Mensal (Kz) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyTuitionKz}
                      onChange={(e) => setFormData({ ...formData, monthlyTuitionKz: Number(e.target.value) })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Situação Financeira Inicial *
                    </label>
                    <select
                      value={formData.financialStatus}
                      onChange={(e) => setFormData({ ...formData, financialStatus: e.target.value as any })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    >
                      <option value="regular">Regular (Sem Dívida)</option>
                      <option value="debito">Em Débito (Mora)</option>
                      <option value="isento">Isento / Bolseiro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. ENCARREGADO DE EDUCAÇÃO & PARENTESCO */}
              <div className="border border-slate-300 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                  <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">family_restroom</span>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    3. Encarregado de Educação & Contactos Oficiais
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Nome do Encarregado de Educação *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Ex: Dr. Afonso Silva"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Parentesco do Encarregado *
                    </label>
                    <select
                      value={formData.guardianRelation}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    >
                      <option value="Pai">Pai</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Tio(a)">Tio(a)</option>
                      <option value="Avô/Avó">Avô/Avó</option>
                      <option value="Irmão/Irmã">Irmão/Irmã</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Telefone do Encarregado *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="+244 912 345 678"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 font-mono font-bold text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      E-mail do Encarregado
                    </label>
                    <input
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      placeholder="encarregado@email.ao"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. HISTÓRICO ESCOLAR */}
              <div className="border border-slate-300 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                  <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">history_edu</span>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    4. Histórico Escolar
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Escola de Proveniência *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder="Ex: Complexo Escolar nº 1205"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Classe Concluída *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastCompletedGrade}
                      onChange={(e) => setFormData({ ...formData, lastCompletedGrade: e.target.value })}
                      placeholder="Ex: 9.ª Classe, 10.ª Classe"
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase font-bold text-slate-700 mb-1">
                      Situação Escolar *
                    </label>
                    <select
                      value={formData.academicSituation}
                      onChange={(e) => setFormData({ ...formData, academicSituation: e.target.value })}
                      className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                    >
                      <option value="Transitado">Transitado (Apto)</option>
                      <option value="Reprovado">Reprovado (Repetição)</option>
                      <option value="Primeira Matrícula">Primeira Matrícula</option>
                      <option value="Transferido">Transferido de Outra Instituição</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. DOCUMENTOS */}
              <div className="border border-slate-300 p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
                  <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">folder_open</span>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    5. Documentos Obrigatórios & Fotografia Tipo Passe
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* B.I. / Cédula / Passaporte */}
                    <div className="p-3 bg-white border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block uppercase font-bold text-slate-700 text-[11px]">
                          Cópia do B.I. / Cédula / Passaporte *
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">PDF / Imagem (Máx 5MB)</span>
                      </div>
                      <select
                        value={formData.docBiCopy}
                        onChange={(e) => setFormData({ ...formData, docBiCopy: e.target.value })}
                        className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                      >
                        <option value="Entregue">Entregue (Conforme)</option>
                        <option value="Pendente">Pendente de Entrega</option>
                        <option value="Dispensado">Dispensado</option>
                      </select>

                      <input
                        type="file"
                        ref={biFileInputRef}
                        accept="application/pdf,image/*"
                        onChange={handleBiFileUpload}
                        className="hidden"
                      />

                      {formData.docBiFile ? (
                        <div className="p-2 bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0">
                              {formData.docBiFile.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-slate-800 truncate text-[11px]">{formData.docBiFile.name}</p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {formatFileSize(formData.docBiFile.size)} • {formData.docBiFile.uploadDate}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveBiFile}
                            className="text-red-600 hover:text-red-800 p-1 cursor-pointer shrink-0"
                            title="Remover ficheiro anexado"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => biFileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-400 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">attach_file</span>
                          <span>Carregar Ficheiro do B.I. / Passaporte</span>
                        </button>
                      )}
                    </div>

                    {/* Certificado Escolar */}
                    <div className="p-3 bg-white border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block uppercase font-bold text-slate-700 text-[11px]">
                          Certificado / Declaração *
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">PDF / Imagem (Máx 5MB)</span>
                      </div>
                      <select
                        value={formData.docCertificate}
                        onChange={(e) => setFormData({ ...formData, docCertificate: e.target.value })}
                        className="w-full h-9 px-3 rounded-none bg-white border border-slate-300 text-slate-800 font-semibold focus:border-[#0b1f3a] focus:outline-none"
                      >
                        <option value="Entregue">Entregue (Original/Autenticado)</option>
                        <option value="Declaração Provisória">Declaração Provisória com Notas</option>
                        <option value="Pendente">Pendente de Entrega</option>
                      </select>

                      <input
                        type="file"
                        ref={certFileInputRef}
                        accept="application/pdf,image/*"
                        onChange={handleCertFileUpload}
                        className="hidden"
                      />

                      {formData.docCertificateFile ? (
                        <div className="p-2 bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0">
                              {formData.docCertificateFile.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                            </span>
                            <div className="truncate">
                              <p className="font-bold text-slate-800 truncate text-[11px]">{formData.docCertificateFile.name}</p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {formatFileSize(formData.docCertificateFile.size)} • {formData.docCertificateFile.uploadDate}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCertFile}
                            className="text-red-600 hover:text-red-800 p-1 cursor-pointer shrink-0"
                            title="Remover ficheiro anexado"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => certFileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-400 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">attach_file</span>
                          <span>Carregar Certificado ou Declaração</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fotografia tipo passe (Foto de Perfil) */}
                  <div className="border border-slate-300 p-3 bg-white">
                    <label className="block uppercase font-bold text-slate-800 mb-2">
                      Fotografia Tipo Passe (Foto de Perfil do Estudante) *
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Visualizador da foto tipo passe retangular/quadrada */}
                      <div className="w-24 h-32 bg-slate-100 border-2 border-[#0b1f3a] flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-none">
                        {formData.docPassPhoto ? (
                          <img
                            src={formData.docPassPhoto}
                            alt="Foto Tipo Passe"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 text-center px-1">Sem Foto</span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          A fotografia tipo passe é utilizada como <strong>foto de perfil oficial</strong> do estudante no sistema, cartões de estudante, fichas biográficas e pautas.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs cursor-pointer border border-[#0b1f3a]"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            Carregar Foto do Computador
                          </button>

                          <span className="text-slate-400 text-xs">ou escolher amostra:</span>

                          <div className="flex items-center gap-1">
                            {DEFAULT_SAMPLE_PHOTOS.slice(0, 4).map((pUrl, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFormData({ ...formData, docPassPhoto: pUrl })}
                                className={`w-8 h-8 border overflow-hidden cursor-pointer ${
                                  formData.docPassPhoto === pUrl ? 'border-2 border-[#7a0c0c]' : 'border-slate-300'
                                }`}
                                title={`Foto de amostra ${idx + 1}`}
                              >
                                <img src={pUrl} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ÁREA DE ANEXAR OUTROS DOCUMENTOS (ATÉ 3 DOCUMENTOS PDF/IMAGEM DE ATÉ 5MB) */}
                  <div className="border border-slate-300 p-3.5 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">note_add</span>
                        <label className="block uppercase font-bold text-slate-800 text-xs">
                          Anexar Outros Documentos Complementares
                        </label>
                      </div>
                      <span className="text-[11px] font-mono text-[#0b1f3a] font-bold bg-blue-50 px-2 py-0.5 border border-blue-200">
                        {formData.additionalDocs.length} de 3 documentos anexados
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Carregue de uma só vez ou gradualmente até <strong>3 documentos</strong> adicionais (Atestado Médico, Cartão de Vacinas, Declarações de Transferência, etc.) em formato <strong>PDF ou Imagem</strong> (máximo de <strong>5MB</strong> por ficheiro).
                    </p>

                    <input
                      type="file"
                      ref={otherDocsInputRef}
                      multiple
                      accept="application/pdf,image/*"
                      onChange={handleAdditionalDocsUpload}
                      className="hidden"
                    />

                    {formData.additionalDocs.length < 3 && (
                      <button
                        type="button"
                        onClick={() => otherDocsInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-400 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#0b1f3a]">upload_file</span>
                        <span>Selecionar Documentos Adicionais (PDF ou Imagem)</span>
                      </button>
                    )}

                    {formData.additionalDocs.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {formData.additionalDocs.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            className="p-2.5 bg-slate-50 border border-slate-300 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="material-symbols-outlined text-[20px] text-[#0b1f3a] shrink-0">
                                {doc.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                              </span>
                              <div className="truncate">
                                <p className="font-bold text-slate-800 truncate text-xs">{doc.name}</p>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {formatFileSize(doc.size)} • Carregado a {doc.uploadDate}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdditionalDoc(doc.id)}
                              className="text-red-600 hover:text-red-800 p-1.5 cursor-pointer shrink-0"
                              title="Remover este documento"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões do Formulário com animação de carregamento circular e confirmação em verde */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-300">
                <button
                  type="button"
                  disabled={submitStatus !== 'idle'}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-none bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer border border-slate-300 disabled:opacity-50"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={submitStatus !== 'idle'}
                  className={`px-6 py-2.5 rounded-none font-bold text-xs transition-all duration-200 text-white shadow-none cursor-pointer border flex items-center gap-2 ${
                    submitStatus === 'success'
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'bg-[#0b1f3a] hover:bg-[#7a0c0c] border-[#0b1f3a] text-white disabled:opacity-80'
                  }`}
                >
                  {submitStatus === 'loading' && (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>A PROCESSAR MATRÍCULA...</span>
                    </>
                  )}
                  {submitStatus === 'success' && (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>OPERAÇÃO FEITA COM SUCESSO!</span>
                    </>
                  )}
                  {submitStatus === 'idle' && (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>{editingStudent ? 'SALVAR ALTERAÇÕES DA MATRÍCULA' : 'CONCLUIR MATRÍCULA ESCOLAR'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FICHA INDIVIDUAL COMPLETA DO ALUNO COM TODOS OS DADOS */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-none max-w-4xl w-full shadow-2xl border border-slate-400 overflow-hidden flex flex-col max-h-[94vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0b1f3a] text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">badge</span>
                <div>
                  <h3 className="font-bold text-base tracking-wide uppercase">Ficha Individual do Aluno</h3>
                  <p className="text-[11px] text-slate-300">
                    República de Angola • Ministério da Educação • Registo Biográfico Oficial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 bg-white">
              {/* Profile Card Header com Fotografia Tipo Passe Quadrada */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-slate-300 bg-slate-50">
                <div className="flex items-center gap-4">
                  {/* Fotografia Oficial Tipo Passe */}
                  <div className="w-20 h-26 bg-slate-200 border-2 border-[#0b1f3a] overflow-hidden shrink-0 shadow-none">
                    <img
                      src={viewingStudent.docPassPhoto || viewingStudent.avatar || DEFAULT_SAMPLE_PHOTOS[0]}
                      alt={viewingStudent.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="inline-block text-[10px] font-bold uppercase bg-[#0b1f3a] text-white px-2 py-0.5 mb-1">
                      {viewingStudent.gender === 'Feminino' || viewingStudent.gender === 'F' ? 'Discente (Feminino)' : 'Discente (Masculino)'}
                    </div>
                    <h4 className="font-headline text-xl font-bold text-[#0b1f3a]">
                      {viewingStudent.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-600">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 border border-slate-300 text-slate-900">
                        Processo: #{viewingStudent.procNumber}
                      </span>
                      <span>•</span>
                      <span className="font-mono font-bold text-slate-800">
                        BI: {viewingStudent.biNumber || viewingStudent.citizenCard || 'Pendente'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800">
                        Turma: {viewingStudent.className}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
                  {viewingStudent.financialStatus === 'regular' ? (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs uppercase">
                      Propinas Regulares
                    </span>
                  ) : viewingStudent.financialStatus === 'debito' ? (
                    <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-300 font-bold text-xs uppercase">
                      Em Débito (Mora)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs uppercase">
                      Isento / Bolseiro
                    </span>
                  )}
                  <span className="text-xs text-slate-600 font-mono font-bold">
                    {(viewingStudent.monthlyTuitionKz || 95000).toLocaleString()} Kz/mês
                  </span>
                </div>
              </div>

              {/* Grid: 1. Identificação Biográfica & Contactos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-300 bg-white">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1f3a] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <span className="material-symbols-outlined text-[16px]">badge</span>
                    1. Identificação Pessoal do Estudante
                  </h5>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Nome Completo:</dt>
                      <dd className="font-bold text-slate-900">{viewingStudent.name}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">N.º do BI / Passaporte:</dt>
                      <dd className="font-mono font-bold text-[#0b1f3a]">
                        {viewingStudent.biNumber || viewingStudent.citizenCard || 'Pendente'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Género:</dt>
                      <dd className="font-semibold text-slate-800">
                        {viewingStudent.gender || 'Masculino'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Nacionalidade:</dt>
                      <dd className="font-semibold text-slate-800">
                        {viewingStudent.nationality || 'Angolana'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Naturalidade:</dt>
                      <dd className="font-semibold text-slate-800">
                        {viewingStudent.birthPlace || 'Luanda'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Data de Nascimento:</dt>
                      <dd className="font-mono text-slate-800">{viewingStudent.birthDate || 'Não registada'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Telefone do Aluno:</dt>
                      <dd className="font-mono font-bold text-[#0b1f3a]">
                        {viewingStudent.studentPhone || 'Não informado'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Endereço / Bairro:</dt>
                      <dd className="font-medium text-slate-800 text-right max-w-[240px]">
                        {viewingStudent.address || 'Luanda, Angola'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 2. Encarregado de Educação */}
                <div className="p-4 border border-slate-300 bg-white">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1f3a] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <span className="material-symbols-outlined text-[16px]">family_restroom</span>
                    2. Encarregado de Educação & Contactos
                  </h5>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Nome do Encarregado:</dt>
                      <dd className="font-bold text-slate-900">{viewingStudent.guardianName || 'Não registado'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Parentesco do Encarregado:</dt>
                      <dd className="font-bold text-[#7a0c0c] uppercase">
                        {viewingStudent.guardianRelation || 'Pai'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Telefone do Encarregado:</dt>
                      <dd className="font-mono font-bold text-[#0b1f3a]">
                        {viewingStudent.guardianPhone ? (
                          <a href={`tel:${viewingStudent.guardianPhone}`} className="hover:underline">
                            {viewingStudent.guardianPhone}
                          </a>
                        ) : (
                          'Sem contacto'
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">E-mail do Encarregado:</dt>
                      <dd className="font-mono text-slate-700">
                        {viewingStudent.guardianEmail || 'Não informado'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Turma Matriculada:</dt>
                      <dd className="font-bold text-slate-900">{viewingStudent.className}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Assiduidade Geral:</dt>
                      <dd className="font-mono font-bold text-emerald-700">
                        {viewingStudent.attendanceRate || 100}%
                      </dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Faltas Injustificadas:</dt>
                      <dd className="font-mono font-bold text-red-600">
                        {viewingStudent.unexcusedAbsences || 0} faltas
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Grid: 4. Histórico Escolar & 5. Documentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4. HISTÓRICO ESCOLAR */}
                <div className="p-4 border border-slate-300 bg-white">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1f3a] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <span className="material-symbols-outlined text-[16px]">history_edu</span>
                    4. Histórico Escolar
                  </h5>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Escola de Proveniência:</dt>
                      <dd className="font-bold text-slate-900 text-right">
                        {viewingStudent.previousSchool || 'Colégio São Francisco de Assis'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <dt className="text-slate-500">Classe Concluída:</dt>
                      <dd className="font-semibold text-slate-800">
                        {viewingStudent.lastCompletedGrade || '9.ª Classe'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-slate-500">Situação de Ingresso:</dt>
                      <dd className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 border border-blue-200 uppercase">
                        {viewingStudent.academicSituation || 'Transitado'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 5. DOCUMENTOS */}
                <div className="p-4 border border-slate-300 bg-white">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1f3a] mb-3 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <span className="material-symbols-outlined text-[16px]">folder_open</span>
                    5. Documentos Apresentados
                  </h5>
                  <dl className="space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100 gap-1">
                      <dt className="text-slate-500">Cópia do B.I. / Cédula / Passaporte:</dt>
                      <div className="flex items-center gap-2">
                        <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 uppercase">
                          {viewingStudent.docBiCopy || 'Entregue'}
                        </dd>
                        {viewingStudent.docBiFile && (
                          <a
                            href={viewingStudent.docBiFile.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={viewingStudent.docBiFile.name}
                            className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0b1f3a] font-bold border border-blue-300 text-[11px]"
                            title="Descarregar ficheiro original"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>{viewingStudent.docBiFile.name.length > 20 ? viewingStudent.docBiFile.name.substring(0, 18) + '...' : viewingStudent.docBiFile.name}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-slate-100 gap-1">
                      <dt className="text-slate-500">Certificado Escolar:</dt>
                      <div className="flex items-center gap-2">
                        <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 uppercase">
                          {viewingStudent.docCertificate || 'Entregue'}
                        </dd>
                        {viewingStudent.docCertificateFile && (
                          <a
                            href={viewingStudent.docCertificateFile.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={viewingStudent.docCertificateFile.name}
                            className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0b1f3a] font-bold border border-blue-300 text-[11px]"
                            title="Descarregar certificado"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            <span>{viewingStudent.docCertificateFile.name.length > 20 ? viewingStudent.docCertificateFile.name.substring(0, 18) + '...' : viewingStudent.docCertificateFile.name}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <dt className="text-slate-500">Fotografia Tipo Passe:</dt>
                      <dd className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300 uppercase">
                        Arquivada no Perfil Oficial
                      </dd>
                    </div>

                    {/* Outros Documentos Anexados */}
                    {viewingStudent.additionalDocs && viewingStudent.additionalDocs.length > 0 && (
                      <div className="pt-2">
                        <dt className="text-slate-600 font-bold uppercase text-[10px] mb-1.5">
                          Documentos Complementares Anexados ({viewingStudent.additionalDocs.length}):
                        </dt>
                        <div className="space-y-1">
                          {viewingStudent.additionalDocs.map((doc, idx) => (
                            <div
                              key={doc.id || idx}
                              className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="material-symbols-outlined text-[16px] text-[#0b1f3a]">
                                  {doc.type.includes('pdf') ? 'picture_as_pdf' : 'image'}
                                </span>
                                <span className="font-semibold text-slate-800 truncate text-[11px]">{doc.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({formatFileSize(doc.size)})</span>
                              </div>
                              <a
                                href={doc.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={doc.name}
                                className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold shrink-0 ml-2"
                              >
                                <span className="material-symbols-outlined text-[12px]">download</span>
                                <span>Baixar</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Avaliações Curriculares Registadas se houver */}
              {viewingStudent.grades && Object.keys(viewingStudent.grades).length > 0 && (
                <div className="border border-slate-300 overflow-hidden">
                  <div className="bg-[#0b1f3a] text-white px-4 py-2.5 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      Classificações Curriculares Oficiais (0 - 20 Valores)
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-200">
                      Ano Letivo {db.settings?.currentAcademicYear || '2024/2025'}
                    </span>
                  </div>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                      <tr>
                        <th className="py-2.5 px-4 border-r border-slate-200">Disciplina</th>
                        <th className="py-2.5 px-4 text-center border-r border-slate-200">Classificação</th>
                        <th className="py-2.5 px-4 text-right">Resultado Qualitativo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {Object.entries(viewingStudent.grades).map(([subj, grade]) => {
                        const val = Number(grade) || 0;
                        const isPass = val >= 10;
                        return (
                          <tr key={subj} className="hover:bg-slate-50">
                            <td className="py-2 px-4 font-sans font-semibold text-slate-800 border-r border-slate-200">
                              {subj}
                            </td>
                            <td className="py-2 px-4 text-center font-bold border-r border-slate-200">
                              <span
                                className={`px-2 py-0.5 border text-xs ${
                                  isPass
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : 'bg-red-50 text-red-800 border-red-300'
                                }`}
                              >
                                {val.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right font-sans font-semibold">
                              {val >= 16 ? 'Excelente' : val >= 14 ? 'Bom' : val >= 10 ? 'Suficiente' : 'Não Apto'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Imprimir Ficha Oficial</span>
              </button>

              <div className="flex items-center gap-2">
                {currentUserRole === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      const s = viewingStudent;
                      setViewingStudent(null);
                      handleOpenEdit(s);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0b1f3a] text-white hover:bg-[#7a0c0c] font-bold text-xs border border-[#0b1f3a] cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Editar Ficha</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAÇÃO DE ELIMINAÇÃO */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none max-w-md w-full shadow-2xl border border-slate-400 overflow-hidden">
            {/* Cabeçalho azul igual ao padrão institucional */}
            <div className="px-5 py-3.5 bg-[#0b1f3a] text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-red-400">warning</span>
                <h3 className="font-bold text-xs tracking-wider uppercase text-white">
                  Confirmar Eliminação do Aluno
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 bg-white">
              <div className="w-12 h-12 bg-red-100 text-[#ac332b] flex items-center justify-center mx-auto mb-4 border border-red-200">
                <span className="material-symbols-outlined text-[28px]">delete_forever</span>
              </div>
              <h4 className="font-headline text-base font-bold text-slate-900 text-center">
                Eliminar Aluno da Base de Dados?
              </h4>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Tem a certeza que deseja eliminar permanentemente a matrícula de{' '}
                <strong className="text-slate-900">{studentToDelete.name}</strong> (Processo nº{' '}
                <span className="font-mono font-bold">{studentToDelete.procNumber}</span>, Turma:{' '}
                {studentToDelete.className})? Esta operação é irreversível e removerá o aluno de todas as pautas e registos.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  dbService.deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-[#ac332b] hover:bg-red-800 text-white font-bold text-xs shadow-none cursor-pointer border border-[#ac332b] transition-all"
              >
                Sim, Eliminar Aluno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

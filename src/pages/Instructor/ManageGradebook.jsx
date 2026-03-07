import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Download, Upload, ArrowLeft, Edit2, RotateCcw, AlertCircle, Save } from 'lucide-react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SVCCLogo from '../../assets/svcc_logo.png';
import { getCurrentUser, getUserId, getUserFullName } from '../../utils/auth';
import '../../components/InstructorLayout/ManageGradebook.css';

const API_URL = 'http://localhost/svcc-enrollment/manage_gradebook.php';

const ManageGradebook = () => {
  const [currentView, setCurrentView] = useState('sections'); // 'sections', 'courses', 'grades'
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [sectionSearchTerm, setSectionSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState('current'); // 'current' or 'previous'

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showManageGradeModal, setShowManageGradeModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  
  const [selectedTermType, setSelectedTermType] = useState('prelim');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [gradeForm, setGradeForm] = useState({
    prelim: '',
    midterm: '',
    prefinals: '',
    finals: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  // Get logged-in instructor's data
  const currentUser = getCurrentUser();
  const instructorId = getUserId();
  const instructorName = getUserFullName();

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  // Verify user is an instructor
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'instructor') {
      console.error('User is not an instructor');
      setIsError(true);
    }
  }, [currentUser]);

 // Load sections when component mounts
  useEffect(() => {
    if (currentView === 'sections' && instructorId) {
      fetchInstructorSections();
    }
  }, [currentView, instructorId, termFilter]);

  // Load courses when section is selected
  useEffect(() => {
  if (currentView === 'courses' && selectedSection && instructorId) {
    fetchSectionCourses(selectedSection.id);
  }
}, [currentView, selectedSection, instructorId, termFilter]); // ADD termFilter as dependency

  // Load students when course is selected
  useEffect(() => {
    if (currentView === 'grades' && selectedCourse && selectedSection && instructorId) {
      fetchCourseStudents(selectedSection.id, selectedCourse.id);
    }
  }, [currentView, selectedCourse, selectedSection, instructorId]);

  const fetchInstructorSections = async () => {
    if (!instructorId) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      const response = await axios.get(`${API_URL}?action=get_instructor_sections&instructor_id=${instructorId}&term_filter=${termFilter}`);
      
      if (response.data.success) {
        setSections(response.data.data);
      } else {
        setIsError(true);
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setIsError(true);
      setMessage({ text: 'Failed to load sections', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSectionCourses = async (sectionId) => {
    if (!instructorId || !sectionId) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log('Fetching courses for instructor:', instructorId, 'section:', sectionId);
      
      const response = await axios.get(`${API_URL}?action=get_section_courses&instructor_id=${instructorId}&section_id=${sectionId}`);
      
      console.log('Courses response:', response.data);
      
      if (response.data.success) {
        setCourses(response.data.data);
        if (response.data.data.length === 0) {
          setMessage({ text: 'No courses found for this section', type: 'error' });
        }
      } else {
        console.error('Failed to load courses:', response.data.message);
        setIsError(true);
        setMessage({ text: response.data.message || 'Failed to load courses', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.response?.data);
      setIsError(true);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load courses';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseStudents = async (sectionId, courseId) => {
    if (!instructorId || !sectionId || !courseId) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log('Fetching students for:', {
        instructor_id: instructorId,
        section_id: sectionId,
        course_id: courseId
      });
      
      const response = await axios.get(`${API_URL}?action=get_course_students&instructor_id=${instructorId}&section_id=${sectionId}&course_id=${courseId}`);
      
      console.log('Students response:', response.data);
      
      if (response.data.success) {
        console.log('Students found:', response.data.data.students.length);
        console.log('Debug info:', response.data.debug);
        
        setStudentGrades(response.data.data.students);
        
        if (response.data.data.students.length === 0) {
          // Show debug info to understand why no students
          const debugInfo = response.data.debug;
          let errorMsg = 'No students enrolled in this course. ';
          
          if (debugInfo) {
            errorMsg += `(Total in section: ${debugInfo.total_in_section}, `;
            errorMsg += `Found: ${debugInfo.students_found}, `;
            if (debugInfo.enrollment_statuses) {
              errorMsg += `Statuses: ${JSON.stringify(debugInfo.enrollment_statuses)})`;
            }
          }
          
          setMessage({ text: errorMsg, type: 'error' });
        }
      } else {
        setIsError(true);
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response?.data);
      setIsError(true);
      setMessage({ text: 'Failed to load students', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    const sectionArray = Array.isArray(sections) ? sections : [];
    if (!sectionSearchTerm) return sectionArray;
    const searchLower = sectionSearchTerm.toLowerCase();
    return sectionArray.filter(section => 
      section.section.toLowerCase().includes(searchLower) ||
      section.program.toLowerCase().includes(searchLower) ||
      section.year_level.toLowerCase().includes(searchLower)
    );
  }, [sections, sectionSearchTerm]);

  const filteredCourses = useMemo(() => {
  const courseArray = Array.isArray(courses) ? courses : [];
  
  // First filter by term status
  let filtered = courseArray.filter(course => {
    if (termFilter === 'current') {
      return course.term_status !== 'ended';
    } else {
      return course.term_status === 'ended';
    }
  });
  
  // Then filter by search term
  if (!courseSearchTerm) return filtered;
  const searchLower = courseSearchTerm.toLowerCase();
  return filtered.filter(course => 
    course.courseName.toLowerCase().includes(searchLower) ||
    course.courseCode.toLowerCase().includes(searchLower)
  );
}, [courses, courseSearchTerm, termFilter]);

  const filteredStudents = useMemo(() => {
    const studentArray = Array.isArray(studentGrades) ? studentGrades : [];
    if (!studentSearchTerm) return studentArray;
    const searchLower = studentSearchTerm.toLowerCase();
    return studentArray.filter(student => 
      student.studentName.toLowerCase().includes(searchLower) ||
      student.studentNumber.toLowerCase().includes(searchLower)
    );
  }, [studentGrades, studentSearchTerm]);

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setCurrentView('courses');
    setCourseSearchTerm('');
  };

  const handleBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
    setCourses([]);
    setSectionSearchTerm('');
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setCurrentView('grades');
    setStudentSearchTerm('');
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setStudentGrades([]);
    setStudentSearchTerm('');
  };

  const handleDownloadTemplate = () => {
    setShowDownloadModal(true);
  };

  const generateExcelTemplate = async () => {
    if (!selectedTermType || !selectedSection || !selectedCourse) {
      setMessage({ text: 'Missing required information', type: 'error' });
      return;
    }

    try {
      // Fetch template data from backend
      const response = await axios.get(
        `${API_URL}?action=download_template&section_id=${selectedSection.id}&course_id=${selectedCourse.id}&term_type=${selectedTermType}&instructor_id=${instructorId}`
      );

      if (!response.data.success) {
        setMessage({ text: response.data.message, type: 'error' });
        return;
      }

      const { section, course, term_type, students } = response.data.data;
      const isAllTerms = term_type === 'all';

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Grades');

      // Merge cells for header - adjust based on template type
      const headerRange = isAllTerms ? 'B1:I4' : 'B1:F4';
      worksheet.mergeCells(headerRange);
      const headerCell = worksheet.getCell('B1');
      headerCell.value = {
        richText: [
          { font: { size: 21, bold: true }, text: isAllTerms ? '               St. Vincent College of Cabuyao\n' : 'St. Vincent College of Cabuyao\n'},
          { font: { size: 13, italic: true }, text: isAllTerms ? '             Brgy. Mamatid, City of Cabuyao, Laguna': 'Brgy. Mamatid, City of Cabuyao, Laguna' }
        ]
      };
      headerCell.alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
      };
      headerCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Load and add logo
      try {
        const logoResponse = await fetch(SVCCLogo);
        const logoBlob = await logoResponse.blob();
        const logoArrayBuffer = await logoBlob.arrayBuffer();
        
        const imageId = workbook.addImage({
          buffer: logoArrayBuffer,
          extension: 'png',
        });

        worksheet.addImage(imageId, {
          tl: { 
            col: isAllTerms ? 3 : 2.9,
            row: 0.75
          },
          ext: { width: 55, height: 55 },
          editAs: 'oneCell'
        });
      } catch (error) {
        console.error('Error adding logo:', error);
      }

      // Term information
      const termRange = isAllTerms ? 'B5:I5' : 'B5:F5';
      worksheet.mergeCells(termRange);
      const termCell = worksheet.getCell('B5');
      termCell.value = `Term: ${term_type.toUpperCase()}`;
      termCell.font = { size: 11, bold: true };
      termCell.alignment = { vertical: 'middle', horizontal: 'left' };
      termCell.border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Course information
      const courseRange = isAllTerms ? 'B6:I6' : 'B6:F6';
      worksheet.mergeCells(courseRange);
      const courseCell = worksheet.getCell('B6');
      courseCell.value = `Course: ${course.course_code} - ${course.course_name}`;
      courseCell.font = { size: 11, bold: true };
      courseCell.alignment = { vertical: 'middle', horizontal: 'left' };
      courseCell.border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Section information
      const sectionRange = isAllTerms ? 'B7:I7' : 'B7:F7';
      worksheet.mergeCells(sectionRange);
      const sectionCell = worksheet.getCell('B7');
      sectionCell.value = `Section: ${section.section} | ${section.year_level} | ${section.term} | ${section.school_year}`;
      sectionCell.font = { size: 11 };
      sectionCell.alignment = { vertical: 'middle', horizontal: 'left' };
      sectionCell.border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Table headers - different for "all" vs single term
      let headers;
      if (isAllTerms) {
        headers = ['Student Number', 'Name', 'Program', 'Course', 'Prelim', 'Midterm', 'Pre-Finals', 'Finals'];
      } else {
        headers = ['Student Number', 'Name', 'Program', 'Course', 'Grade'];
      }
      
      const headerRow = worksheet.getRow(8);
      
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 2);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD10F0F' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Add student data
      students.forEach((student, index) => {
        const row = worksheet.getRow(9 + index);
        
        // Student Number (Column B)
        const studentNumCell = row.getCell(2);
        studentNumCell.value = student.student_number;
        studentNumCell.alignment = { vertical: 'middle', horizontal: 'left' };
        studentNumCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Name (Column C)
        const nameCell = row.getCell(3);
        nameCell.value = student.full_name;
        nameCell.alignment = { vertical: 'middle', horizontal: 'left' };
        nameCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Program (Column D)
        const programCell = row.getCell(4);
        programCell.value = student.program;
        programCell.alignment = { vertical: 'middle', horizontal: 'left' };
        programCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Course (Column E)
        const courseCodeCell = row.getCell(5);
        courseCodeCell.value = course.course_code;
        courseCodeCell.alignment = { vertical: 'middle', horizontal: 'center' };
        courseCodeCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        if (isAllTerms) {
          const prelimCell = row.getCell(6);
          prelimCell.value = student.prelim !== null && student.prelim !== undefined ? student.prelim : '';
          prelimCell.alignment = { vertical: 'middle', horizontal: 'center' };
          prelimCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          const midtermCell = row.getCell(7);
          midtermCell.value = student.midterm !== null && student.midterm !== undefined ? student.midterm : '';
          midtermCell.alignment = { vertical: 'middle', horizontal: 'center' };
          midtermCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          const preFinalsCell = row.getCell(8);
          preFinalsCell.value = student.prefinals !== null && student.prefinals !== undefined ? student.prefinals : '';
          preFinalsCell.alignment = { vertical: 'middle', horizontal: 'center' };
          preFinalsCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

          const finalsCell = row.getCell(9);
          finalsCell.value = student.finals !== null && student.finals !== undefined ? student.finals : '';
          finalsCell.alignment = { vertical: 'middle', horizontal: 'center' };
          finalsCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        } else {
          // Single term - populate the matching term grade if it exists
          const termGradeMap = { prelim: student.prelim, midterm: student.midterm, prefinals: student.prefinals, finals: student.finals };
          const existingGrade = termGradeMap[selectedTermType];
          const gradeCell = row.getCell(6);
          gradeCell.value = existingGrade !== null && existingGrade !== undefined ? existingGrade : '';
          gradeCell.alignment = { vertical: 'middle', horizontal: 'center' };
          gradeCell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        }
      });

      // Set column widths based on template type
      if (isAllTerms) {
        worksheet.getColumn(1).width = 5;   // Column A (empty)
        worksheet.getColumn(2).width = 18;  // Column B (Student Number)
        worksheet.getColumn(3).width = 35;  // Column C (Name)
        worksheet.getColumn(4).width = 45;  // Column D (Program)
        worksheet.getColumn(5).width = 15;  // Column E (Course)
        worksheet.getColumn(6).width = 12;  // Column F (Prelim)
        worksheet.getColumn(7).width = 12;  // Column G (Midterm)
        worksheet.getColumn(8).width = 12;  // Column H (Pre-Finals)
        worksheet.getColumn(9).width = 12;  // Column I (Finals)
      } else {
        worksheet.getColumn(1).width = 5;   // Column A (empty)
        worksheet.getColumn(2).width = 18;  // Column B (Student Number)
        worksheet.getColumn(3).width = 35;  // Column C (Name)
        worksheet.getColumn(4).width = 45;  // Column D (Program)
        worksheet.getColumn(5).width = 15;  // Column E (Course)
        worksheet.getColumn(6).width = 12;  // Column F (Grade)
      }

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = `${course.course_code}_${section.section}_${term_type}_Template.xlsx`;
      saveAs(blob, filename);

      setShowDownloadModal(false);
      setMessage({ text: 'Excel template downloaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error generating Excel template:', error);
      setMessage({ text: 'Failed to generate Excel template', type: 'error' });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Please select a file', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      // Read Excel file
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await selectedFile.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.getWorksheet('Grades');
      if (!worksheet) {
        setMessage({ text: 'Invalid Excel file format', type: 'error' });
        setIsLoading(false);
        return;
      }

      // Extract term type from row 5 (B5 cell)
      const termCell = worksheet.getCell('B5').value;
      const termMatch = termCell ? termCell.toString().match(/Term: (\w+)/i) : null;
      const termType = termMatch ? termMatch[1].toLowerCase() : selectedTermType;

      const isAllTerms = termType === 'all';

      // Extract grades starting from row 9
      const grades = [];
      let rowIndex = 9;

      while (true) {
        const row = worksheet.getRow(rowIndex);
        const studentNumber = row.getCell(2).value;  // Column B (Student Number)

        if (!studentNumber) break;

        if (isAllTerms) {
          // For "all" template, read all four grade columns
          const prelimValue = row.getCell(6).value;    // Column F (Prelim)
          const midtermValue = row.getCell(7).value;   // Column G (Midterm)
          const preFinalsValue = row.getCell(8).value; // Column H (Pre-Finals)
          const finalsValue = row.getCell(9).value;    // Column I (Finals)

          const gradeEntry = {
            student_number: studentNumber.toString(),
            prelim: prelimValue !== null && prelimValue !== '' ? parseFloat(prelimValue) : null,
            midterm: midtermValue !== null && midtermValue !== '' ? parseFloat(midtermValue) : null,
            prefinals: preFinalsValue !== null && preFinalsValue !== '' ? parseFloat(preFinalsValue) : null,
            finals: finalsValue !== null && finalsValue !== '' ? parseFloat(finalsValue) : null
          };

          // Only add if at least one grade is present
          if (gradeEntry.prelim !== null || gradeEntry.midterm !== null || 
              gradeEntry.prefinals !== null || gradeEntry.finals !== null) {
            grades.push(gradeEntry);
          }
        } else {
          // For single term template
          const gradeValue = row.getCell(6).value;  // Column F (Grade)

          if (gradeValue !== null && gradeValue !== '') {
            grades.push({
              student_number: studentNumber.toString(),
              grade: parseFloat(gradeValue)
            });
          }
        }

        rowIndex++;
      }

      if (grades.length === 0) {
        setMessage({ text: 'No grades found in the Excel file', type: 'error' });
        setIsLoading(false);
        return;
      }

      console.log('Importing grades:', { termType, gradesCount: grades.length, sampleGrade: grades[0] });

      // Send to backend
       const response = await axios.post(`${API_URL}?action=import_grades`, {
        instructor_id: instructorId,
        section_id: selectedSection.id,
        course_id: selectedCourse.id,
        term_type: termType,
        grades: grades
      }, { headers: auditHeaders });

      console.log('Import response:', response.data);

      if (response.data.success) {
        setMessage({ 
          text: `Grades imported successfully! ${response.data.data.success_count} records imported.`, 
          type: 'success' 
        });
        setShowImportModal(false);
        setSelectedFile(null);
        
        // Wait a moment then refresh to ensure DB is updated
        setTimeout(() => {
          fetchCourseStudents(selectedSection.id, selectedCourse.id);
        }, 500);
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error importing grades:', error);
      console.error('Error details:', error.response?.data);
      setMessage({ text: 'Failed to import grades: ' + (error.response?.data?.message || error.message), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertUpload = () => {
    setShowRevertModal(true);
  };

  const confirmRevertUpload = async () => {
    if (!selectedTermType || !selectedCourse || !selectedSection) {
      setMessage({ text: 'Missing required information', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}?action=revert_upload`, {
        instructor_id: instructorId,
        course_code: selectedCourse.courseCode,
        term: selectedSection.term,
        school_year: selectedSection.school_year,
        term_type: selectedTermType
      }, { headers: auditHeaders });

      if (response.data.success) {
        setMessage({ 
          text: `Upload reverted successfully! ${response.data.affected_rows} records updated.`, 
          type: 'success' 
        });
        setShowRevertModal(false);
        
        // Refresh student grades
        setTimeout(() => {
          fetchCourseStudents(selectedSection.id, selectedCourse.id);
        }, 500);
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error reverting upload:', error);
      setMessage({ text: 'Failed to revert upload', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const openManageGradeModal = (student) => {
    setSelectedStudent(student);
    setGradeForm({
      prelim: student.prelim !== null ? student.prelim.toString() : '',
      midterm: student.midterm !== null ? student.midterm.toString() : '',
      prefinals: student.prefinals !== null ? student.prefinals.toString() : '',
      finals: student.finals !== null ? student.finals.toString() : ''
    });
    setShowManageGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedCourse || !selectedSection) {
      setMessage({ text: 'Missing required information', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        instructor_id: instructorId,
        user_id: selectedStudent.id,
        course_code: selectedCourse.courseCode,
        term: selectedSection.term,
        school_year: selectedSection.school_year,
        prelim: gradeForm.prelim !== '' ? parseFloat(gradeForm.prelim) : null,
        midterm: gradeForm.midterm !== '' ? parseFloat(gradeForm.midterm) : null,
        prefinals: gradeForm.prefinals !== '' ? parseFloat(gradeForm.prefinals) : null,
        finals: gradeForm.finals !== '' ? parseFloat(gradeForm.finals) : null
      };

      console.log('Submitting grade update:', payload);

      const response = await axios.post(`${API_URL}?action=update_grade`, payload, { headers: auditHeaders });

      console.log('Update grade response:', response.data);

      if (response.data.success) {
        setMessage({ text: 'Grades updated successfully', type: 'success' });
        setShowManageGradeModal(false);
        
        // Refresh student grades
        setTimeout(() => {
          fetchCourseStudents(selectedSection.id, selectedCourse.id);
        }, 500);
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      console.error('Error details:', error.response?.data);
      setMessage({ text: 'Failed to update grade: ' + (error.response?.data?.message || error.message), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Render sections list view
  const renderSectionsView = () => (
    <div className="managegradebook-container">
      <div className="managegradebook-header-card">
        <div className="managegradebook-header-content">
          <h1 className="managegradebook-page-title">Manage Gradebook</h1>
          <div className="managegradebook-header-actions">
            <div className="managegradebook-filter-group">
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="managegradebook-filter-select"
              >
               <option value="current">Current Sem</option>
              <option value="previous">Previous Sem</option>
              </select>
            </div>
            <div className="managegradebook-search-container">
              <input 
                type="text" 
                placeholder="Search sections..." 
                className="managegradebook-search-input" 
                value={sectionSearchTerm} 
                onChange={(e) => setSectionSearchTerm(e.target.value)} 
              />
              <Search className="managegradebook-search-icon" size={18} />
              {sectionSearchTerm && (
                <button 
                  onClick={() => setSectionSearchTerm('')} 
                  className="managegradebook-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="managegradebook-courses-container">
        {isLoading ? (
          <div className="managegradebook-loading-container">
            <div className="managegradebook-loading-spinner"></div>
            <p className="managegradebook-loading-text">Loading sections...</p>
          </div>
        ) : isError ? (
          <div className="managegradebook-error-container">
            <AlertCircle size={40} className="managegradebook-error-icon" />
            <p className="managegradebook-error-text">Failed to load sections</p>
            <button 
              onClick={fetchInstructorSections}
              className="managegradebook-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="managegradebook-empty-container">
            <p className="managegradebook-empty-text">No sections found</p>
          </div>
        ) : (
          <div className="managegradebook-courses-grid">
            {filteredSections.map((section) => (
              <div key={section.id} className="managegradebook-course-card">
                <div className="managegradebook-card-header">
                  <h3 className="managegradebook-course-name">{section.section}</h3>
                  <button 
                    onClick={() => handleViewSection(section)} 
                    className="managegradebook-btn managegradebook-btn-view"
                  >
                    View Courses
                  </button>
                </div>
                <div className="managegradebook-card-content">
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Program:</span>
                    <span className="managegradebook-info-value">{section.program}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Year Level:</span>
                    <span className="managegradebook-info-value">{section.year_level}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Sem:</span>
                    <span className="managegradebook-info-value">{section.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">School Year:</span>
                    <span className="managegradebook-info-value">{section.school_year}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Enrolled Students:</span>
                    <span className="managegradebook-info-value">{section.current_students}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">My Courses:</span>
                    <span className="managegradebook-info-value">{section.course_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render courses list view
  const renderCoursesView = () => (
    <div className="managegradebook-container">
      <div className="managegradebook-header-card">
        <div className="managegradebook-header-content">
          <div className="managegradebook-title-with-back">
            <button 
              onClick={handleBackToSections} 
              className="managegradebook-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="managegradebook-page-title">{selectedSection?.section} - Courses</h1>
          </div>
          <div className="managegradebook-header-actions">
            <div className="managegradebook-search-container">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="managegradebook-search-input" 
                value={courseSearchTerm} 
                onChange={(e) => setCourseSearchTerm(e.target.value)} 
              />
              <Search className="managegradebook-search-icon" size={18} />
              {courseSearchTerm && (
                <button 
                  onClick={() => setCourseSearchTerm('')} 
                  className="managegradebook-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="managegradebook-courses-container">
        {isLoading ? (
          <div className="managegradebook-loading-container">
            <div className="managegradebook-loading-spinner"></div>
            <p className="managegradebook-loading-text">Loading courses...</p>
          </div>
        ) : isError ? (
          <div className="managegradebook-error-container">
            <AlertCircle size={40} className="managegradebook-error-icon" />
            <p className="managegradebook-error-text">Failed to load courses</p>
            <button 
              onClick={() => fetchSectionCourses(selectedSection.id)}
              className="managegradebook-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="managegradebook-empty-container">
            {courseSearchTerm ? (
              <>
                <p className="managegradebook-empty-text">No courses found matching "{courseSearchTerm}"</p>
                <button 
                  onClick={() => setCourseSearchTerm('')}
                  className="managegradebook-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="managegradebook-empty-text">No courses found in this section</p>
            )}
          </div>
        ) : (
          <div className="managegradebook-courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="managegradebook-course-card">
                <div className="managegradebook-card-header">
                  <h3 className="managegradebook-course-name">{course.courseName}</h3>
                  <button 
                    onClick={() => handleViewCourse(course)} 
                    className="managegradebook-btn managegradebook-btn-view"
                  >
                    View
                  </button>
                </div>
                <div className="managegradebook-card-content">
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Course Code:</span>
                    <span className="managegradebook-info-value">{course.courseCode}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">No. of Enrolled Students:</span>
                    <span className="managegradebook-info-value">{course.enrolledStudents}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Section:</span>
                    <span className="managegradebook-info-value">{course.section}</span>
                  </div>
                  <div className="managegradebook-info-item">
                    <span className="managegradebook-info-label">Sem:</span>
                    <span className="managegradebook-info-value">{course.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')} - {course.school_year}</span>
                  </div>
                  <div className="managegradebook-divider"></div>
                  <div className="managegradebook-upload-status">
                    <div className="managegradebook-status-item">
                      <span className="managegradebook-status-label">Prelim:</span>
                      <span className={`managegradebook-status-badge ${course.prelim === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>
                        {course.prelim}
                      </span>
                    </div>
                    <div className="managegradebook-status-item">
                      <span className="managegradebook-status-label">Midterm:</span>
                      <span className={`managegradebook-status-badge ${course.midterm === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>
                        {course.midterm}
                      </span>
                    </div>
                    <div className="managegradebook-status-item">
                      <span className="managegradebook-status-label">Pre-Finals:</span>
                      <span className={`managegradebook-status-badge ${course.prefinals === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>
                        {course.prefinals}
                      </span>
                    </div>
                    <div className="managegradebook-status-item">
                      <span className="managegradebook-status-label">Finals:</span>
                      <span className={`managegradebook-status-badge ${course.finals === 'Uploaded' ? 'uploaded' : 'not-uploaded'}`}>
                        {course.finals}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render grades view
  const renderGradesView = () => (
    <div className="managegradebook-container">
      <div className="managegradebook-header-card">
        <div className="managegradebook-header-content">
          <div className="managegradebook-title-with-back">
            <button 
              onClick={handleBackToCourses} 
              className="managegradebook-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="managegradebook-page-title">{selectedCourse?.courseName}</h1>
          </div>
          <div className="managegradebook-header-actions">
            <div className="managegradebook-search-container">
              <input 
                type="text" 
                placeholder="Search students..." 
                className="managegradebook-search-input" 
                value={studentSearchTerm} 
                onChange={(e) => setStudentSearchTerm(e.target.value)} 
              />
              <Search className="managegradebook-search-icon" size={18} />
              {studentSearchTerm && (
                <button 
                  onClick={() => setStudentSearchTerm('')} 
                  className="managegradebook-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`managegradebook-message ${message.type === 'success' ? 'managegradebook-message-success' : 'managegradebook-message-error'}`}>
          <AlertCircle size={20} className="managegradebook-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="managegradebook-actions-bar">
        {selectedCourse?.term_status !== 'ended' ? (
          <>
            <button 
              onClick={handleDownloadTemplate} 
              className="managegradebook-action-btn managegradebook-download-btn"
            >
              <Download size={18} />
              Download Excel Template
            </button>
            <button 
              onClick={() => setShowImportModal(true)} 
              className="managegradebook-action-btn managegradebook-import-btn"
            >
              <Upload size={18} />
              Import Excel Grade
            </button>
            <button 
              onClick={handleRevertUpload} 
              className="managegradebook-action-btn managegradebook-revert-btn"
            >
              <RotateCcw size={18} />
              Revert Upload
            </button>
          </>
        ) : (
          <div className="managegradebook-term-ended-notice">
            <AlertCircle size={20} />
            <span>This term has ended. Grades can no longer be modified.</span>
          </div>
        )}
      </div>

      <div className="managegradebook-table-container">
        {isLoading ? (
          <div className="managegradebook-loading-container">
            <div className="managegradebook-loading-spinner"></div>
            <p className="managegradebook-loading-text">Loading students...</p>
          </div>
        ) : isError ? (
          <div className="managegradebook-error-container">
            <AlertCircle size={40} className="managegradebook-error-icon" />
            <p className="managegradebook-error-text">Failed to load students</p>
            <button 
              onClick={() => fetchCourseStudents(selectedSection.id, selectedCourse.id)}
              className="managegradebook-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="managegradebook-empty-container">
            {studentSearchTerm ? (
              <>
                <p className="managegradebook-empty-text">No students found matching "{studentSearchTerm}"</p>
                <button 
                  onClick={() => setStudentSearchTerm('')}
                  className="managegradebook-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="managegradebook-empty-text">No students enrolled</p>
            )}
          </div>
        ) : (
          <div className="managegradebook-table-scroll">
            <table className="managegradebook-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>Prelim</th>
                  <th>Midterm</th>
                  <th>Pre-Finals</th>
                  <th>Finals</th>
                  <th>Final Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Student Number:">
                      <div className="managegradebook-student-number">{student.studentNumber}</div>
                    </td>
                    <td data-label="Name:">
                      <div className="managegradebook-student-name">{student.studentName}</div>
                    </td>
                    <td data-label="Prelim:">
                      <span className="managegradebook-grade-cell">
                        {student.prelim !== null ? Number(student.prelim).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td data-label="Midterm:">
                      <span className="managegradebook-grade-cell">
                        {student.midterm !== null ? Number(student.midterm).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td data-label="Pre-Finals:">
                      <span className="managegradebook-grade-cell">
                        {student.prefinals !== null ? Number(student.prefinals).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td data-label="Finals:">
                      <span className="managegradebook-grade-cell">
                        {student.finals !== null ? Number(student.finals).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td data-label="Final Grade:">
                      <span className="managegradebook-final-grade-cell">
                        {student.finalGrade !== null ? Number(student.finalGrade).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td data-label="Actions:">
                      {selectedCourse?.term_status !== 'ended' ? (
                        <button 
                          onClick={() => openManageGradeModal(student)}
                          className="managegradebook-table-action-btn"
                        >
                          <Edit2 size={16} />
                          Manage
                        </button>
                      ) : (
                        <span className="managegradebook-action-disabled">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Template Modal */}
      {showDownloadModal && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Download Excel Template</h2>
              <div className="managegradebook-form-group">
                <label className="managegradebook-form-label">Select Term Type:</label>
                <select
                  value={selectedTermType}
                  onChange={(e) => setSelectedTermType(e.target.value)}
                  className="managegradebook-form-input"
                >
                  <option value="prelim">Prelim</option>
                  <option value="midterm">Midterm</option>
                  <option value="prefinals">Pre-Finals</option>
                  <option value="finals">Finals</option>
                  <option value="all">All Terms</option>
                </select>
              </div>
              <div className="managegradebook-modal-actions">
                <button 
                  onClick={() => setShowDownloadModal(false)} 
                  className="managegradebook-button managegradebook-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={generateExcelTemplate} 
                  className="managegradebook-button managegradebook-button-primary"
                >
                  <Download size={18} className="managegradebook-button-icon" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Import Excel Grade</h2>
              <div className="managegradebook-import-reminder">
                <AlertCircle size={20} className="managegradebook-reminder-icon" />
                <p className="managegradebook-reminder-text">
                  This only works with the provided excel template. Make sure to double check the name and grades of students before importing.
                </p>
              </div>
              <div className="managegradebook-file-upload">
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  className="managegradebook-file-input"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="managegradebook-modal-actions">
                <button 
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                  }} 
                  className="managegradebook-button managegradebook-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImportExcel} 
                  className="managegradebook-button managegradebook-button-primary"
                  disabled={!selectedFile || isLoading}
                >
                  <Upload size={18} className="managegradebook-button-icon" />
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Grade Modal */}
      {showManageGradeModal && selectedStudent && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Manage Grades - {selectedStudent?.studentName}</h2>
              <form onSubmit={handleGradeSubmit}>
                <div className="managegradebook-form-row">
                  <div className="managegradebook-form-group">
                    <label className="managegradebook-form-label">Prelim</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="100" 
                      value={gradeForm.prelim} 
                      onChange={(e) => setGradeForm({...gradeForm, prelim: e.target.value})} 
                      className="managegradebook-form-input" 
                      placeholder="Enter grade" 
                    />
                  </div>
                  <div className="managegradebook-form-group">
                    <label className="managegradebook-form-label">Midterm</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="100" 
                      value={gradeForm.midterm} 
                      onChange={(e) => setGradeForm({...gradeForm, midterm: e.target.value})} 
                      className="managegradebook-form-input" 
                      placeholder="Enter grade" 
                    />
                  </div>
                </div>
                <div className="managegradebook-form-row">
                  <div className="managegradebook-form-group">
                    <label className="managegradebook-form-label">Pre-Finals</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="100" 
                      value={gradeForm.prefinals} 
                      onChange={(e) => setGradeForm({...gradeForm, prefinals: e.target.value})} 
                      className="managegradebook-form-input" 
                      placeholder="Enter grade" 
                    />
                  </div>
                  <div className="managegradebook-form-group">
                    <label className="managegradebook-form-label">Finals</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="100" 
                      value={gradeForm.finals} 
                      onChange={(e) => setGradeForm({...gradeForm, finals: e.target.value})} 
                      className="managegradebook-form-input" 
                      placeholder="Enter grade" 
                    />
                  </div>
                </div>
                <div className="managegradebook-modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowManageGradeModal(false)} 
                    className="managegradebook-button managegradebook-button-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="managegradebook-button managegradebook-button-primary"
                    disabled={isLoading}
                  >
                    <Save size={18} className="managegradebook-button-icon" />
                    Save Grades
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Revert Upload Modal */}
      {showRevertModal && (
        <div className="managegradebook-modal-overlay">
          <div className="managegradebook-modal-content">
            <div className="managegradebook-modal-body">
              <h2 className="managegradebook-modal-title">Revert Upload</h2>
              <div className="managegradebook-import-reminder">
                <AlertCircle size={20} className="managegradebook-reminder-icon" />
                <p className="managegradebook-reminder-text">
                  This will delete all grades for the selected term. This action cannot be undone.
                </p>
              </div>
              <div className="managegradebook-form-group">
                <label className="managegradebook-form-label">Select Term Type to Revert:</label>
                <select
                  value={selectedTermType}
                  onChange={(e) => setSelectedTermType(e.target.value)}
                  className="managegradebook-form-input"
                >
                  <option value="prelim">Prelim</option>
                  <option value="midterm">Midterm</option>
                  <option value="prefinals">Pre-Finals</option>
                  <option value="finals">Finals</option>
                </select>
              </div>
              <div className="managegradebook-modal-actions">
                <button 
                  onClick={() => setShowRevertModal(false)} 
                  className="managegradebook-button managegradebook-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRevertUpload} 
                  className="managegradebook-button managegradebook-button-primary"
                  disabled={isLoading}
                  style={{ backgroundColor: '#f59e0b' }}
                >
                  <RotateCcw size={18} className="managegradebook-button-icon" />
                  Revert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main render logic
  if (currentView === 'sections') {
    return renderSectionsView();
  } else if (currentView === 'courses') {
    return renderCoursesView();
  } else {
    return renderGradesView();
  }
};

export default ManageGradebook;
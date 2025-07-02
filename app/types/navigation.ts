export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  ClassroomDetails: {
    classId?: string;
    isNew?: boolean;
    isEdit?: boolean;
    refresh?: boolean;
  };
  AddStudent: undefined;
  EditStudent: { studentId: string };
  AddStudentsToClassroom: { classroomId: string; currentStudentIds?: string[] };
  ClassroomStudents: {
    classroomId: string;
    classroomName: string;
    students: Array<{
      _id: string;
      name: string;
      registrationId: string;
    }>;
  };
  TakeAttendance: {
    classroomId: string;
    classroomName: string;
    students: Array<{
      _id: string;
      name: string;
      registrationId: string;
    }>;
    date?: string;
  };
  ConfirmAbsentees: {
    classroomId: string;
    classroomName: string;
    date: string;
    absentStudentIds: string[];
    absentStudents: Array<{
      _id: string;
      name: string;
      registrationId: string;
    }>;
    totalStudents: number;
  };
  AttendanceRecords: {
    classroomId: string;
    classroomName: string;
  };
  AttendanceRecordDetails: {
    attendanceRecord: {
      _id: string;
      date: string;
      records: Array<{
        _id?: string;
        student: {
          id: string;
          name: string;
          registrationId: string;
        };
        present: boolean;
      }>;
      statistics: {
        totalStudents: number;
        presentStudents: number;
        absentStudents: number;
        attendanceRate: number;
      };
      smsSent: boolean;
      smsNotifiedStudents: string[];
      createdAt: string;
      updatedAt: string;
    };
    classroomName: string;
  };
  ResetPassword: undefined;
  EditProfile: undefined;
  Tabs: { refresh?: boolean } | undefined;
};

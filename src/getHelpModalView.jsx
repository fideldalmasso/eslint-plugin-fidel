import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  FormControl,
  MenuItem,
  Select,
  Fade,
  Modal,
  TextareaAutosize
} from '@mui/material';
// Icons
import { X, ChevronDown } from 'react-feather';
import PillButton from './pillButtonView';

export default function GetHelpModal(props) {
  const classes = useStyles();
  const {
    // Props
    open,
    handleOnClose,
    source,
    showExam,
    userEmail,
    // States
    mylaunchDarklyAccess,
    studentData,
    organizationId,
    organizationSettings,
    userData,
    courseData,
    examData,
    actualQuestionExam,
    actualQuestionStudySession,
    // Functions
    sendStudentFeedback,
    sendExamFeedback,
    sendQuestionFeedback,
    sendIntercomAutomaticMessage,
    getOrganizationSettings,
    deleteNotification
  } = props;

  return (
                  <PillButton
                smallRadius
                disabled={loading}
                color="white"
                label="Cancel"
                handleClick={closeModal}
              />
  );
}

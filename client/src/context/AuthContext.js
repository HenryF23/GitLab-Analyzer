import React, { useState, createContext } from 'react';

const AuthContext = createContext();

const AuthProvider = (props) => {
  const [user, setUser] = useState(null);
  const [repo, setRepo] = useState(null);
  const [incorrect, setIncorrect] = useState(false);
  const [selectUser, setSelectUser] = useState('');
  const [commitsList, setCommitsList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [mergeRequestList, setMergeRequestList] = useState({});
  const [commentsList, setCommentsList] = useState({});
  const [selectMembersList, setSelectMembersList] = useState([]);
  const [overviewScore, setOverviewScore] = useState({});
  const [dailyArray, setDailyArray] = useState([]);
  const [dateArray, setDateArray] = useState([]);
  const [countArray, setCountArray] = useState([]);

  const authContextValue = {
    user,
    setUser,
    repo,
    setRepo,
    incorrect,
    setIncorrect,
    selectUser,
    setSelectUser,
    commitsList,
    setCommitsList,
    membersList,
    setMembersList,
    usersList,
    setUsersList,
    notesList,
    setNotesList,
    mergeRequestList,
    setMergeRequestList,
    commentsList,
    setCommentsList,
    selectMembersList,
    setSelectMembersList,
    overviewScore,
    setOverviewScore,
    dailyArray, 
    setDailyArray,
    dateArray,
    setDateArray,
    countArray,
    setCountArray
  };
  return <AuthContext.Provider value={authContextValue} {...props} />;
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };

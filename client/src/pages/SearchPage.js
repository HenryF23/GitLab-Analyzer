import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router';
import { Alert, Spin } from 'antd';
import axios from 'axios';
import '../App.css';
import '../Shared.css';
import Logo from '../components/Logo';
import SearchBar from '../components/login/SearchBar';
import { useAuth } from '../context/AuthContext';
import Repo from '../components/login/Repo';
import LogOut from '../components/LogOut';

function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const {
    user,
    setRepo,
    mergeRequestList,
    reList,
    setReList,
    filteredList,
    setFilteredList,
  } = useAuth();

  const dateToAgoConverter = (date) => {
    if (date === null) {
      return null;
    }
    const dateBefore = new Date(date + '-0700');
    const dateAfter = new Date();

    return (dateAfter - dateBefore) / (1000 * 60);
  };

  useEffect(() => {
    const getRepos = async () => {
      setLoading(true);
      const repoList = await axios.get('http://localhost:5678/projects', {
        withCredentials: true,
      });
      setRepo(repoList.data.projects);

      const projectsData = repoList.data.projects;
      console.log('projects data', projectsData);

      const projectsList = projectsData.map((project) => {
        return {
          id: project.id,
          name: project.name,
          lastSynced: dateToAgoConverter(project.last_synced),
        };
      });
      setReList([...projectsList]);
      setFilteredList([...projectsList]);
      setLoading(false);
    };
    getRepos();
  }, []);

  const loadingContainer = () => {
    if (loading) {
      return (
        <div style={{ margin: '50px' }}>
          <Spin tip="Loading ...">
            <Alert
              message="Loading repository list"
              description="Please wait while we retrieve your repository information."
              type="info"
            />
          </Spin>
        </div>
      );
    } else if (analyzing && user) {
      return (
        <div style={{ margin: '50px' }}>
          <Spin tip="Analyzing...">
            <Alert
              message="Analyzing selected repository"
              description="Please wait while we analyze your selected repository."
              type="info"
            />
          </Spin>
        </div>
      );
    } else {
      return null;
    }
  };

  if (user) {
    return (
      <div className="main_container">
        <div className="rightalign">
          <LogOut />
        </div>
        <div className="App">
          <div className="center">
            <div className="m-bot">
              <Logo />
            </div>
            <SearchBar
              reList={reList}
              setLoading={setLoading}
              setFilteredList={setFilteredList}
              filteredList={filteredList}
            />
            {loadingContainer()}
            <Repo
              setAnalyzing={setAnalyzing}
              loading={loading}
              analyzing={analyzing}
              filteredList={filteredList}
              setFilteredList={setFilteredList}
            />
          </div>
        </div>
      </div>
    );
  } else {
    return <Redirect to="/" />;
  }
}

export default SearchPage;

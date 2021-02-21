import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { Button, Checkbox, List, Avatar } from 'antd';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Repo = ({ repo, setAnalyzing }) => {
  const { overview, setOverview, commitsList, setCommitsList } = useAuth();
  const [redirect, setRedirect] = useState(false);

  const repoList = [
    repo,
    'Administrator / Earth GitLab 373',
    'Administrator / Mars GitLab 373',
    'Administrator / Jupiter GitLab 373',
  ];

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const projectRes = await axios.post(
        'http://localhost:5678/setProject',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          params: {
            projectID: 2,
          },
        }
      );

      if (projectRes.data['response'] !== 'ok') {
        throw new Error('Fetch request failed.');
      }

      const overviewRes = await axios.get(
        'http://localhost:5678/getProjectOverview'
      );
      if (overviewRes) {
        setOverview(overviewRes.data.users);
      }
      const commitsRes = await axios.get('http://localhost:5678/getCommits');
      if (commitsRes) {
        const commitsArray = commitsRes.data.commit_list;

        setCommitsList(
          commitsArray.map((commit) => ({
            authorName: commit.author_name,
            commitedDate: new Date(commit.commited_date),
            committerName: commit.committer_name,
            id: commit.id,
            title: commit.title,
          }))
        );
      }

      setAnalyzing(false);
      setRedirect(true);
    } catch (error) {
      setAnalyzing(false);
      console.log(error);
    }
  };

  if (redirect) {
    return <Redirect to="/overview" />;
  }

  return (
    <div>
      <List
        style={{ marginTop: '20px' }}
        className="demo-loadmore-list"
        // loading={initLoading}
        itemLayout="horizontal"
        dataSource={repoList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="details">Details</Button>,
              <Button onClick={handleAnalyze} key="analyze">
                Analyze
              </Button>,
              <Checkbox>Batch</Checkbox>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  shape="square"
                  src="https://cdn4.iconfinder.com/data/icons/logos-and-brands-1/512/144_Gitlab_logo_logos-512.png"
                />
              }
              title={<a href="http://localhost:6789/overview">{item}</a>}
              description="Web app for GitLab Analyzer"
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default Repo;

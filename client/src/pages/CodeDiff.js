import React, { useState, useEffect } from 'react';
import { parseDiff, Diff, Hunk, Decoration } from 'react-diff-view';
import { PageHeader, Descriptions, Checkbox, List, Button } from 'antd';
import { CloudDownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'react-diff-view/style/index.css';
import './styles.css';
import { useAuth } from '../context/AuthContext';

const Appdiff = ({ diffText }) => {
  const [collapse, setCollapse] = useState(false);
  const files = parseDiff(diffText);

  const handleCollapse = (e) => {
    setCollapse(!collapse);
  };

  useEffect(() => {}, [collapse]);

  const renderFile = ({
    oldPath,
    newPath,
    oldRevision,
    newRevision,
    type,
    hunks,
  }) => (
    <div key={oldRevision + '-' + newRevision} className="file-diff">
      <header
        style={{ display: 'flex', justifyContent: 'space-between' }}
        className="diff-header"
      >
        {oldPath === newPath ? oldPath : `${oldPath} -> ${newPath}`}
        <div>
          <Button style={{ marginRight: '10px' }}>Score: 800</Button>
          <Button style={{ marginRight: '10px' }}>Score Breakdown</Button>
          <Checkbox>Ignore</Checkbox>
          <Checkbox onChange={handleCollapse}>Collapse</Checkbox>
        </div>
      </header>
      {collapse ? null : (
        <Diff viewType="unified" diffType={type} hunks={hunks}>
          {(hunks) =>
            hunks.map((hunk) => [
              <Decoration key={'deco-' + hunk.content}>
                <div className="hunk-header">{hunk.content}</div>
              </Decoration>,
              <Hunk key={hunk.content} hunk={hunk} />,
            ])
          }
        </Diff>
      )}
    </div>
  );
  return <div className="ubuntu">{files.map(renderFile)}</div>;
};

const CodeDiff = ({ codeId }) => {
  const [codeDiff, setCodeDiff] = useState([]);
  const [codeFiles, setCodeFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);

  const { setCodeDiffId, codeDiffId } = useAuth();

  useEffect(() => {
    const getData = async () => {
      const codeRes = await axios.get(
        `http://localhost:5678/projects/2/code_diff/${codeDiffId}`
      );
      console.log('data', codeRes.data.code_diff_list);
      await setCodeDiff(codeRes.data.code_diff_list);
      const files = codeDiff.map((code) => code.new_path);
      setCodeFiles(files);
    };
    getData();
  }, [codeDiffId]);

  const data = [
    'README.md',
    'scripts/hulk.js',
    'src/diff2html.js',
    'src/joganjs-utils.js',
    'src/line-by-line-printer.js',
    'test/side-by-side.js',
  ];

  const codeDiffHeader = () => {
    return (
      <div className="site-page-header-ghost-wrapper">
        <PageHeader
          ghost={false}
          onBack={() => window.history.back()}
          title="Title"
          subTitle="This is a subtitle"
          extra={[
            <Button key="1" type="primary">
              File Changes
            </Button>,
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Created by">Lili Qu</Descriptions.Item>
            <Descriptions.Item label="Association">
              <a>421421</a>
            </Descriptions.Item>
            <Descriptions.Item label="Created On">2017-01-10</Descriptions.Item>
            <Descriptions.Item label="Last Changed">
              2017-10-10
            </Descriptions.Item>
            <Descriptions.Item label="Remarks">
              Gonghu Road, Xihu District, Hangzhou, Zhejiang, China
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
      </div>
    );
  };

  const fileChanges = () => {
    return (
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex' }}>
          <h2 style={{ marginRight: '10px' }}>File changed</h2>
          <Button
            onClick={() => {
              setShowFiles(!showFiles);
            }}
          >
            Show
          </Button>
        </div>
      </div>
    );
  };

  const fileList = () => {
    return (
      <div style={{ marginBottom: '20px' }}>
        <List
          size="small"
          dataSource={codeFiles}
          renderItem={(item) => (
            <List.Item>
              <FileExcelOutlined /> {item}
            </List.Item>
          )}
        />
      </div>
    );
  };

  // console.log(codeDiff[0].diff);

  const header =
    'diff --git a/requirements.txt b/requirements.txt\nindex c3f75dc..2cda10e 100644\n--- a/requirements.txt\n+++ b/requirements.txt\n';

  const headerGenerator = (code) => {
    let header = 'diff --git';
    header =
      header +
      ' a/' +
      code.old_path +
      ' b/' +
      code.new_path +
      '\n' +
      'index c3f75dc..2cda10e 100644\n' +
      '--- a/' +
      code.old_path +
      '\n+++ b/' +
      code.new_path +
      '\n';
    return header + code.diff;
  };

  const mapDiff = codeDiff.map((code) => (
    <>
      {console.log(code)}
      <Appdiff diffText={headerGenerator(code)} />
      {/* <Appdiff diffText={header + code.diff} /> */}
    </>
  ));

  // const wow = hey + codeDiff[0].diff;

  return (
    <div
      style={{
        marginLeft: '10px',
        marginRight: '10px',
        marginTop: '10px',
        fontFamily: 'Ubuntu Mono',
      }}
    >
      {/* <Appdiff diffText={wow} /> */}
      {codeDiffHeader()}
      {fileChanges()}
      {showFiles ? fileList() : null}
      {codeDiff ? mapDiff : null}
    </div>
  );
};

export default CodeDiff;
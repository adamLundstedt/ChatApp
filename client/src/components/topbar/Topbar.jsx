import Button from 'react-bootstrap/Button';
import "./topbar.css";


export default function Topbar({ adminCheck }) {
  return (
    <div className={`topbarContainer ${adminCheck ? 'bg-success' : ''}`}>
      <div className="topbarLeft">
      </div>
      <div className="topbarCenter">
        <div className='text-center'>
          <h3 className='text-white'>{adminCheck ? 'Admin Panel' : 'Chat App'}</h3>
        </div>
      </div>
      <div className="topbarRight">
        <div className='text-end'>
          <Button variant="danger" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Log Out</Button>
        </div>
      </div>
    </div>
  );
}

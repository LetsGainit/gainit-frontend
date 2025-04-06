import './css/App.css'
import ProjectCard from './components/ProjectCard'
import Home from "./pages/home"
import SearchProject from './pages/SearchProjects'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavigatorBar'

function App() {
  return (
    <div>
      <NavBar />
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/Search-Project' element={<SearchProject />}/>
      </Routes>
    </main>
    </div>
  );
}

export default App

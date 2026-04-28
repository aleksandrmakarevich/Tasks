import {useQuery} from '@apollo/client/react';
import {gql} from '@apollo/client';
import './App.css'
import {useAuthStore} from "./store/useAuthStore.ts";


// localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzM3MTQ0MiwiZXhwIjoxNzc3NDU3ODQyfQ.Z90PojWjueT8Lupm3uylkEC6ugakzMQo_9JWOLa5owU')
const GET_TASKS = gql`
  query GetTasks {
    getTasks {
      id
      title
    }
  }
`;
interface GetTasksData {
    getTasks: { id: number; title: string }[];
}
function App() {
    const token = useAuthStore((state) => state.token);
    const {loading, error, data} = useQuery<GetTasksData>(GET_TASKS);
    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="text-red-500">Error: {error.message}</p>;
    if (!data || !data.getTasks) return <p>Задач не найдено</p>;
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Мои задачи</h1>
            {!token && <p className="text-yellow-500">Вы работаете в гостевом режиме</p>}
            <ul>
                {data.getTasks.map((task) => (
                    <li key={task.id} className="border-b py-2">{task.title}</li>
                ))}
            </ul>
        </div>
    )
}

export default App

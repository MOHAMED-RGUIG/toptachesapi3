import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sql from './database.js'; 
import authRoutes from './routes/auth.js'; 
import userRoutes from './routes/user.js'; 
import updateUserRoutes from './routes/updateuser.js';
import addTaskRoutes from './routes/addtask.js';
import tasksAllRoutes from './routes/tasksall.js';
import updateTaskRoutes from './routes/updatetask.js';
import taskByNumRoutes from './routes/taskbynum.js'; 
import deleteTaskRoutes from './routes/deletetask.js'; 
import notificationRoutes from './routes/notification.js';
import sendEmailRoutes from './routes/sendemail.js';
import saveClientDataRoutes from './routes/savedataemailing.js'; 
import editClientDataRoutes from './routes/editdataemailing.js';
import deleteClientDataRoutes from './routes/deletedataemailing.js';
import getallClientDataRoutes from './routes/getalldataemailing.js';
import downloadFileRoutes from './routes/downloadfile.js'
import getClientDataByIDRoutes from './routes/getdataemailingbyid.js'



const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin:["https://topclass-expresso.vercel.app"],
  methods:["POST","GET","DELETE","PUT"],
  credentials:true}));
// Use the auth routes
app.use('/auth', authRoutes);

// Use the user routes
app.use('/user', userRoutes);

// Use the updateUser routes
app.use('/updateuser', updateUserRoutes);

// Use the tasks routes
app.use('/addtask', addTaskRoutes); 
app.use('/tasks', taskByNumRoutes); 
app.use('/tasks', tasksAllRoutes); 
app.use('/tasks', updateTaskRoutes);  
app.use('/tasks', deleteTaskRoutes);    

app.use('/notifications', notificationRoutes);
app.use('/api', sendEmailRoutes);
app.use('/saveClientData', saveClientDataRoutes);
app.use('/editClientData', editClientDataRoutes);
app.use('/deleteClientData', deleteClientDataRoutes);
app.use('/getallClientData', getallClientDataRoutes);
app.use('/downloadOrder', downloadFileRoutes);
app.use('/getClientDataByID', getClientDataByIDRoutes);

app.use('/api', sendEmailRoutes);
app.get("/", async (req, res) => {
  res.send("Server working!!!");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

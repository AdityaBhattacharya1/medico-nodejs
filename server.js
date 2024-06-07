import express from 'express'
import mongoose from 'mongoose'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import 'dotenv/config'

const app = express()
app.use(express.json({ limit: '50mb' }))

const MONGO_LINK = process.env.MONGO_LINK

// Connect to MongoDB
mongoose.connect(MONGO_LINK)
mongoose.connection
	.once('open', () => console.log('MongoDB up and running!'))
	.on('error', (error) => console.error('MongoDB connection error:', error))

// Define User Schema
const UserSchema = new mongoose.Schema({
	clerkId: { type: String, required: true, unique: true },
	userId: { type: String, required: true },
	email: { type: String },
	value: { type: Number, required: true },
})

// Define Sensor Data Schema
const SensorDataSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	value: { type: Number, required: true },
	timestamp: { type: Date, default: Date.now },
})

const User = mongoose.model('User', UserSchema)
const SensorData = mongoose.model('SensorData', SensorDataSchema)

// Routes
app.get('/', (req, res) => res.send('Hello World!'))

app.post('/user/data', ClerkExpressWithAuth(), async (req, res) => {
	console.log('req body', req.body)
	try {
		const { field1, clerkUserId, userId } = req.body

		const existingUser = await User.findOne({ userId: userId })

		if (existingUser) {
			existingUser.value = field1
			await existingUser.save()
			console.log('User document updated:', existingUser)
		} else {
			const newUser = new User({
				clerkId: clerkUserId,
				value: field1,
				userId: userId,
			})
			await newUser.save()
			console.log('New user document created:', newUser)

			const newData = new SensorData({
				clerkId: clerkUserId,
				value: field1,
				userId: userId,
			})
			await newData.save()
			console.log('New sensor data saved!')
		}

		res.status(200).json({ message: 'Data saved successfully' })
	} catch (error) {
		console.error('Error saving data:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
})

app.get('/user/data/:id', ClerkExpressWithAuth(), async (req, res) => {
	try {
		const { id } = req.params
		const sensorData = await User.find(
			{ userId: id },
			{ value: 1, _id: 0 }
		).sort({ timestamp: -1 })

		res.status(200).json(sensorData)
	} catch (error) {
		console.error('Error retrieving data:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
})

app.listen(3000, () => {
	console.log('App listening on port 3000!')
})

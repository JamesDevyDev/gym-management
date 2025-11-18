import mongoose from "mongoose"

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.NEXT_MONGO_URL!)
    } catch (error) {
        console.log(error)
    }
}

export default connectDb
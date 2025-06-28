import bcrypt from 'bcryptjs'

export const passwordUtils = {
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  },

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }
}

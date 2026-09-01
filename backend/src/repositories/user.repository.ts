import pool from '../config/db';
import { User, UserRole } from '../types/database';

export class UserRepository {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create a new user
   */
  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
    role: UserRole
  ): Promise<User> {
    const query = `
      INSERT INTO users (first_name, last_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [firstName, lastName, email, passwordHash, role]);
    return result.rows[0];
  }

  /**
   * Update a user
   */
  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const allowedFields = ['first_name', 'last_name', 'email', 'password_hash', 'role', 'phone', 'profile_image', 'bio', 'location'];
    const updates_obj = updates as Record<string, any>;
    
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates_obj)) {
      if (allowedFields.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

export default new UserRepository();

import jwt from 'jsonwebtoken';

interface Props {
  id: string;
  key: string;
  time: string;
}

const generateToken = ({ id, key, time }: Props) => {
  return jwt.sign({ id }, key, {
    expiresIn: time,
  });
};

export default generateToken;

import profile from './api/profile';
import post from './api/post';
import comment from './api/comment';
import community from './api/community';
import explore from './api/explore';
import wallet from './api/wallet';
import token from './api/token';

const proxy = {
  profile,
  post,
  comment,
  community,
  explore,
  wallet,
  token,
};

export default proxy;

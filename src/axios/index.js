import profile from './api/profile';
import post from './api/post';
import comment from './api/comment';
import community from './api/community';
import explore from './api/explore';

const proxy = {
  profile,
  post,
  comment,
  community,
  explore,
};

export default proxy;

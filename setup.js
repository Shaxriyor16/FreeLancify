import fs from 'fs';
import path from 'path';

const folders = [
  'frontend/css/pages',
  'frontend/js/components',
  'frontend/js/pages',
  'backend/models',
  'backend/schemas',
  'backend/routers',
  'backend/services',
  'backend/middleware',
  'backend/utils',
  'backend/migrations/versions'
];

const files = [
  // Frontend HTML
  'frontend/job-detail.html',
  'frontend/freelancers.html',
  'frontend/profile.html',
  'frontend/dashboard-client.html',
  'frontend/dashboard-freelancer.html',
  'frontend/login.html',
  'frontend/register.html',
  'frontend/post-job.html',
  'frontend/proposals.html',
  'frontend/contract.html',
  'frontend/messages.html',
  'frontend/wallet.html',
  'frontend/notifications.html',

  // Frontend CSS
  'frontend/css/animations.css',
  'frontend/css/pages/home.css',
  'frontend/css/pages/jobs.css',
  'frontend/css/pages/dashboard.css',
  'frontend/css/pages/auth.css',
  'frontend/css/pages/messages.css',

  // Frontend JS
  'frontend/js/auth.js',
  'frontend/js/router.js',
  'frontend/js/store.js',
  'frontend/js/components/navbar.js',
  'frontend/js/components/job-card.js',
  'frontend/js/components/filter-panel.js',
  'frontend/js/components/toast.js',
  'frontend/js/components/modal.js',
  'frontend/js/components/chat.js',
  'frontend/js/pages/home.js',
  'frontend/js/pages/jobs.js',
  'frontend/js/pages/job-detail.js',
  'frontend/js/pages/dashboard.js',
  'frontend/js/pages/auth.js',
  'frontend/js/pages/wallet.js',
  'frontend/js/pages/messages.js',

  // Backend root
  'backend/main.py',
  'backend/config.py',
  'backend/database.py',
  'backend/requirements.txt',
  'backend/alembic.ini',
  'backend/.env.example',
  
  // Backend models
  'backend/models/__init__.py',
  'backend/models/user.py',
  'backend/models/job.py',
  'backend/models/proposal.py',
  'backend/models/contract.py',
  'backend/models/message.py',
  'backend/models/review.py',
  'backend/models/wallet.py',
  'backend/models/notification.py',

  // Backend schemas
  'backend/schemas/__init__.py',
  'backend/schemas/user.py',
  'backend/schemas/job.py',
  'backend/schemas/proposal.py',
  'backend/schemas/contract.py',
  'backend/schemas/message.py',
  'backend/schemas/wallet.py',

  // Backend routers
  'backend/routers/__init__.py',
  'backend/routers/auth.py',
  'backend/routers/users.py',
  'backend/routers/jobs.py',
  'backend/routers/proposals.py',
  'backend/routers/contracts.py',
  'backend/routers/messages.py',
  'backend/routers/wallet.py',
  'backend/routers/reviews.py',
  'backend/routers/notifications.py',
  'backend/routers/search.py',
  'backend/routers/admin.py',

  // Backend services
  'backend/services/__init__.py',
  'backend/services/auth_service.py',
  'backend/services/job_service.py',
  'backend/services/proposal_service.py',
  'backend/services/contract_service.py',
  'backend/services/wallet_service.py',
  'backend/services/notification_service.py',
  'backend/services/email_service.py',

  // Backend middleware
  'backend/middleware/__init__.py',
  'backend/middleware/auth_middleware.py',
  'backend/middleware/rate_limit.py',

  // Backend utils
  'backend/utils/__init__.py',
  'backend/utils/jwt.py',
  'backend/utils/password.py',
  'backend/utils/helpers.py',

  // Root
  'docker-compose.yml',
  'README.md'
];

folders.forEach(f => fs.mkdirSync(f, { recursive: true }));
files.forEach(f => {
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, '');
  }
});
console.log('Structure created successfully!');

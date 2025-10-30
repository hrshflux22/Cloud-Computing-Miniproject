// Amazon Cognito Authentication Service
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ''
};

const userPool = new CognitoUserPool(poolData);

/**
 * Login with Cognito
 */
export const cognitoLogin = (
  email: string,
  password: string
): Promise<{ success: boolean; session?: CognitoUserSession; error?: string }> => {
  return new Promise((resolve) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        console.log('Cognito login successful');
        resolve({
          success: true,
          session: session
        });
      },
      onFailure: (err) => {
        console.error('Cognito login failed:', err);
        resolve({
          success: false,
          error: err.message || 'Login failed'
        });
      }
    });
  });
};

/**
 * Logout from Cognito
 */
export const cognitoLogout = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
    console.log('User logged out from Cognito');
  }
};

/**
 * Get current logged-in user
 */
export const getCurrentCognitoUser = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();

    if (!cognitoUser) {
      reject(new Error('No user logged in'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('No session'));
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const userData: Record<string, string> = {};
        attributes?.forEach(attr => {
          userData[attr.Name] = attr.Value;
        });

        resolve({
          username: cognitoUser.getUsername(),
          email: userData.email,
          name: userData.name,
          session: session,
          isValid: session.isValid()
        });
      });
    });
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      resolve(false);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Create new Cognito user directly (without Lambda)
 * Uses Cognito's signUp API
 */
export const createCognitoUser = async (
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    return new Promise((resolve) => {
      userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({
            Name: 'email',
            Value: email
          }),
          new CognitoUserAttribute({
            Name: 'name',
            Value: name
          })
        ],
        [],
        (err: any, result: any) => {
          if (err) {
            console.error('Cognito signUp error:', err);
            resolve({
              success: false,
              error: err.message || 'Failed to create user'
            });
            return;
          }

          resolve({
            success: true,
            data: {
              username: result?.user.getUsername(),
              userConfirmed: result?.userConfirmed,
              message: 'User created successfully. Admin needs to confirm the user in Cognito Console.'
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Error creating Cognito user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
};

package internal

import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.main.TestCaseMain


/**
 * This class is generated automatically by Katalon Studio and should not be modified or deleted.
 */
public class GlobalVariable {
     
    /**
     * <p>Profile default : Base URL of FoodX Application</p>
     */
    public static Object BASE_URL
     
    /**
     * <p>Profile default : Default Wait Timeout in seconds</p>
     */
    public static Object DEFAULT_TIMEOUT
     
    /**
     * <p>Profile default : Test User Username</p>
     */
    public static Object TEST_USERNAME
     
    /**
     * <p>Profile default : Test User Email</p>
     */
    public static Object TEST_EMAIL
     
    /**
     * <p>Profile default : Test User Password</p>
     */
    public static Object TEST_PASSWORD
     

    static {
        try {
            def selectedVariables = TestCaseMain.getGlobalVariables('default')
			selectedVariables += TestCaseMain.getGlobalVariables(RunConfiguration.getExecutionProfile())
    
            BASE_URL = selectedVariables['BASE_URL']
            DEFAULT_TIMEOUT = selectedVariables['DEFAULT_TIMEOUT']
            TEST_USERNAME = selectedVariables['TEST_USERNAME']
            TEST_EMAIL = selectedVariables['TEST_EMAIL']
            TEST_PASSWORD = selectedVariables['TEST_PASSWORD']
            
        } catch (Exception e) {
            TestCaseMain.logGlobalVariableError(e)
        }
    }
}

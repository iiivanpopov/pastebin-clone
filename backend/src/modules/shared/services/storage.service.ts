import { S3 } from '@aws-sdk/client-s3'
import ApiError from '@exceptions/ApiError'

class StorageService {
	constructor(private s3: S3, private bucket: string) {}

	private async checkFileExistence(name: string): Promise<void> {
		try {
			await this.s3.headObject({ Bucket: this.bucket, Key: name })
		} catch (error) {
			if (error?.$metadata?.httpStatusCode === 404) {
				throw ApiError.NotFound(`File with name "${name}" not found.`)
			}
			throw new Error(`Error checking file existence: ${error.message}`)
		}
	}

	async createFile(name: string, content: string): Promise<void> {
		try {
			await this.checkFileExistence(name)
			throw ApiError.BadRequest(`File with name "${name}" already exists.`)
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				await this.s3.putObject({
					Bucket: this.bucket,
					Key: name,
					Body: content,
				})
			} else {
				throw error
			}
		}
	}

	async updateFile(name: string, content: string): Promise<void> {
		await this.checkFileExistence(name)
		await this.s3.putObject({
			Bucket: this.bucket,
			Key: name,
			Body: content,
		})
	}

	async deleteFile(name: string): Promise<void> {
		await this.checkFileExistence(name)
		await this.s3.deleteObject({ Bucket: this.bucket, Key: name })
	}

	async deleteFiles(names: string[]): Promise<void> {
		const keys = names.map(value => ({ Key: value }))
		await this.s3.deleteObjects({
			Bucket: this.bucket,
			Delete: { Objects: keys },
		})
	}

	async getFileContent(name: string): Promise<string> {
		await this.checkFileExistence(name)
		const response = await this.s3.getObject({ Bucket: this.bucket, Key: name })
		if (!response.Body) {
			throw new Error('Error: File content could not be read.')
		}
		const content = await response.Body.transformToString()
		return content
	}
}

export default StorageService
